import { CoolCommException } from '@cool-midway/core';
import { Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Context } from '@midwayjs/koa';
import { Equal, In, Repository } from 'typeorm';
import * as moment from 'moment';
import { AppointmentEntity } from '../entity/appointment';
import { WorkOrderEntity } from '../../workorder/entity/work_order';
import { VehicleEntity } from '../../vehicle/entity/vehicle';
import { ServiceEntity } from '../../service/entity/service';
import { CustomerEntity } from '../../customer/entity/customer';
import { UserInfoEntity } from '../../user/entity/info';
import { StoreEntity } from '../../store/entity/store';
import { UserAccountBindService } from '../../user/service/account_bind';

export type TodayTaskItem = {
  id: number;
  appointmentId: number;
  workOrderId: number | null;
  plate: string;
  model: string;
  serviceName: string;
  arriveTime: string;
  status: 'pending' | 'signed' | 'doing' | 'done';
  statusText: string;
  statusType: string;
  contact: string;
  remark: string | null;
};

export type TodayStats = {
  todayCount: number;
  doneCount: number;
  arrivedCount?: number;
  doingCount?: number;
  revenue?: string;
};

/** 店长端今日预约项（含技师名） */
export type ManagerTodayItem = TodayTaskItem & { time: string; tech: string };

/**
 * 员工端今日任务、签到、统计
 */
@Provide()
export class AppointmentEmployeeTaskService {
  @Inject()
  ctx: Context;

  @InjectEntityModel(AppointmentEntity)
  appointmentRepo: Repository<AppointmentEntity>;

  @InjectEntityModel(WorkOrderEntity)
  workOrderRepo: Repository<WorkOrderEntity>;

  @InjectEntityModel(VehicleEntity)
  vehicleRepo: Repository<VehicleEntity>;

  @InjectEntityModel(ServiceEntity)
  serviceRepo: Repository<ServiceEntity>;

  @InjectEntityModel(CustomerEntity)
  customerRepo: Repository<CustomerEntity>;

  @InjectEntityModel(UserInfoEntity)
  userInfoRepo: Repository<UserInfoEntity>;

  @InjectEntityModel(StoreEntity)
  storeRepo: Repository<StoreEntity>;

  @Inject()
  userAccountBindService: UserAccountBindService;

  private getTenantId(): number | null {
    const tid = this.ctx.user?.tenantId;
    return tid != null && !Number.isNaN(Number(tid)) ? Number(tid) : null;
  }

  private getTodayRange(): { start: string; end: string } {
    const start = moment().format('YYYY-MM-DD 00:00:00');
    const end = moment().add(1, 'day').format('YYYY-MM-DD 00:00:00');
    return { start, end };
  }

  /**
   * 今日任务列表（当前门店、已确认、今日预约，含签到/工单状态）
   */
  async getTodayTasks(): Promise<TodayTaskItem[]> {
    const tenantId = this.getTenantId();
    if (tenantId == null) {
      return [];
    }
    const { start, end } = this.getTodayRange();

    const appointments = await this.appointmentRepo.find({
      where: {
        tenantId: Equal(tenantId),
        status: Equal(1), // 已确认
      },
      order: { appointmentTime: 'ASC' },
    });

    const filtered = appointments.filter(
      a => {
        const t = moment(a.appointmentTime).format('YYYY-MM-DD HH:mm:ss');
        return t >= start && t < end;
      }
    );

    if (filtered.length === 0) return [];

    const appointmentIds = filtered.map(a => a.id);
    const workOrders = await this.workOrderRepo.find({
      where: { appointmentId: In(appointmentIds) },
    });
    const woMap = new Map<number, WorkOrderEntity>();
    workOrders.forEach(wo => woMap.set(wo.appointmentId, wo));

    const vehicleIds = [...new Set(filtered.map(a => a.vehicleId).filter(Boolean))] as number[];
    const serviceIds = [...new Set(filtered.map(a => a.serviceId).filter(Boolean))] as number[];
    const customerIds = [...new Set(filtered.map(a => a.customerId))];

    const vehicles = vehicleIds.length > 0
      ? await this.vehicleRepo.find({ where: { id: In(vehicleIds) } })
      : [];
    const services = serviceIds.length > 0
      ? await this.serviceRepo.find({ where: { id: In(serviceIds) } })
      : [];
    const customers = await this.customerRepo.find({ where: { id: In(customerIds) } });

    const vehicleMap = new Map(vehicles.map(v => [v.id, v]));
    const serviceMap = new Map(services.map(s => [s.id, s]));
    const customerMap = new Map(customers.map(c => [c.id, c]));

    const result: TodayTaskItem[] = [];
    for (const a of filtered) {
      const wo = woMap.get(a.id) ?? null;
      const vehicle = a.vehicleId != null ? vehicleMap.get(a.vehicleId) : null;
      const service = a.serviceId != null ? serviceMap.get(a.serviceId) : null;
      const customer = customerMap.get(a.customerId);

      let status: TodayTaskItem['status'] = 'pending';
      let statusText = '待到店';
      let statusType = 'warning';
      if (wo != null) {
        if (wo.checkInTime != null) {
          if (wo.status === 2) {
            status = 'done';
            statusText = '已完成';
            statusType = 'info';
          } else if (wo.status === 1) {
            status = 'doing';
            statusText = '施工中';
            statusType = 'success';
          } else {
            status = 'signed';
            statusText = '已签到';
            statusType = 'primary';
          }
        } else {
          status = 'signed';
          statusText = '已签到';
          statusType = 'primary';
        }
      }

      const arriveTime = moment(a.appointmentTime).format('HH:mm');
      const contact = customer
        ? `${customer.name ?? ''} ${(customer.phone ?? '').replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}`.trim()
        : '';

      result.push({
        id: a.id,
        appointmentId: a.id,
        workOrderId: wo?.id ?? null,
        plate: vehicle?.plateNumber ?? '',
        model: vehicle?.model ?? vehicle?.brand ?? '—',
        serviceName: service?.name ?? '—',
        arriveTime,
        status,
        statusText,
        statusType,
        contact,
        remark: a.remark ?? null,
      });
    }
    return result;
  }

  /**
   * 今日统计（当前门店）
   */
  async getTodayStats(): Promise<TodayStats> {
    const tenantId = this.getTenantId();
    if (tenantId == null) {
      return { todayCount: 0, doneCount: 0, arrivedCount: 0, doingCount: 0 };
    }
    const { start, end } = this.getTodayRange();

    const appointments = await this.appointmentRepo.find({
      where: {
        tenantId: Equal(tenantId),
        status: Equal(1),
      },
    });
    const filtered = appointments.filter(
      a => {
        const t = moment(a.appointmentTime).format('YYYY-MM-DD HH:mm:ss');
        return t >= start && t < end;
      }
    );
    const todayCount = filtered.length;
    const appointmentIds = filtered.map(a => a.id);

    if (appointmentIds.length === 0) {
      return { todayCount: 0, doneCount: 0, arrivedCount: 0, doingCount: 0 };
    }

    const workOrders = await this.workOrderRepo.find({
      where: { appointmentId: In(appointmentIds) },
    });
    const arrivedCount = workOrders.filter(wo => wo.checkInTime != null).length;
    const doingCount = workOrders.filter(wo => wo.status === 1).length;
    const doneCount = workOrders.filter(wo => wo.status === 2).length;

    return {
      todayCount,
      doneCount,
      arrivedCount,
      doingCount,
      revenue: '0', // 预留，后续从订单汇总
    };
  }

  /**
   * 店长端今日预约列表（含技师名，用于工作台）
   */
  async getManagerTodayList(): Promise<ManagerTodayItem[]> {
    const tasks = await this.getTodayTasks();
    if (tasks.length === 0) return [];

    const appointments = await this.appointmentRepo.find({
      where: { id: In(tasks.map(t => t.appointmentId)) },
    });
    const techIds = [...new Set(appointments.map(a => a.technicianId).filter(Boolean))] as number[];
    const users =
      techIds.length > 0
        ? await this.userInfoRepo.find({ where: { id: In(techIds) } })
        : [];
    const techMap = new Map(users.map(u => [u.id, u.nickName ?? '—']));

    return tasks.map(t => {
      const apt = appointments.find(a => a.id === t.appointmentId);
      const tech =
        apt?.technicianId != null ? techMap.get(apt.technicianId) ?? '—' : '—';
      const aptTime = apt?.appointmentTime != null
        ? moment(apt.appointmentTime).format('HH:mm')
        : '';
      return {
        ...t,
        time: aptTime,
        tech,
      };
    });
  }

  /**
   * 店长端预约列表（当前门店，支持 tab 筛选）
   * @param tab all | pending | arrived | done | cancelled
   */
  async getManagerAppointmentList(tab: string): Promise<
    Array<{
      id: number;
      plate: string;
      serviceName: string;
      dateTime: string;
      tech: string;
      statusText: string;
      statusType: string;
      canCancel: boolean;
    }>
  > {
    const tenantId = this.getTenantId();
    if (tenantId == null) return [];

    const appointments = await this.appointmentRepo.find({
      where: { tenantId: Equal(tenantId) },
      order: { appointmentTime: 'DESC' },
    });

    if (appointments.length === 0) return [];

    const appointmentIds = appointments.map(a => a.id);
    const workOrders = await this.workOrderRepo.find({
      where: { appointmentId: In(appointmentIds) },
    });
    const woMap = new Map(workOrders.map(wo => [wo.appointmentId, wo]));

    const vehicleIds = [...new Set(appointments.map(a => a.vehicleId).filter(Boolean))] as number[];
    const serviceIds = [...new Set(appointments.map(a => a.serviceId).filter(Boolean))] as number[];
    const techIds = [...new Set(appointments.map(a => a.technicianId).filter(Boolean))] as number[];

    const [vehicles, services, users] = await Promise.all([
      vehicleIds.length > 0 ? this.vehicleRepo.find({ where: { id: In(vehicleIds) } }) : [],
      serviceIds.length > 0 ? this.serviceRepo.find({ where: { id: In(serviceIds) } }) : [],
      techIds.length > 0 ? this.userInfoRepo.find({ where: { id: In(techIds) } }) : [],
    ]);
    const vehicleMap = new Map(vehicles.map(v => [v.id, v]));
    const serviceMap = new Map(services.map(s => [s.id, s]));
    const techMap = new Map(users.map(u => [u.id, u.nickName ?? '—']));

    const statusTextMap: Record<string, string> = {
      pending: '待到店',
      arrived: '已到店',
      doing: '施工中',
      done: '已完成',
      cancelled: '已取消',
    };
    const statusTypeMap: Record<string, string> = {
      pending: 'warning',
      arrived: 'primary',
      doing: 'success',
      done: 'info',
      cancelled: 'info',
    };

    const result: Array<{
      id: number;
      plate: string;
      serviceName: string;
      dateTime: string;
      tech: string;
      statusText: string;
      statusType: string;
      canCancel: boolean;
      _status: string;
    }> = [];

    for (const a of appointments) {
      if (a.status === 2) {
        if (tab === 'all' || tab === 'cancelled') {
          result.push({
            id: a.id,
            plate: (a.vehicleId != null ? vehicleMap.get(a.vehicleId)?.plateNumber : null) ?? '—',
            serviceName: (a.serviceId != null ? serviceMap.get(a.serviceId)?.name : null) ?? '—',
            dateTime: moment(a.appointmentTime).format('MM-DD HH:mm'),
            tech: (a.technicianId != null ? techMap.get(a.technicianId) : null) ?? '—',
            statusText: '已取消',
            statusType: 'info',
            canCancel: false,
            _status: 'cancelled',
          });
        }
        continue;
      }

      const wo = woMap.get(a.id) ?? null;
      let _status = 'pending';
      if (wo != null) {
        if (wo.status === 2) _status = 'done';
        else if (wo.status === 1) _status = 'doing';
        else if (wo.checkInTime != null) _status = 'arrived';
      }

      if (tab !== 'all' && tab !== _status) continue;

      result.push({
        id: a.id,
        plate: (a.vehicleId != null ? vehicleMap.get(a.vehicleId)?.plateNumber : null) ?? '—',
        serviceName: (a.serviceId != null ? serviceMap.get(a.serviceId)?.name : null) ?? '—',
        dateTime: moment(a.appointmentTime).format('MM-DD HH:mm'),
        tech: (a.technicianId != null ? techMap.get(a.technicianId) : null) ?? '—',
        statusText: statusTextMap[_status] ?? '—',
        statusType: statusTypeMap[_status] ?? 'info',
        canCancel: _status === 'pending',
        _status,
      });
    }

    return result.map(({ _status, ...r }) => r);
  }

  /**
   * 预约详情（员工端签到页展示，含车牌/服务/联系人；customerPhone/storePhone 用于拨号）
   */
  async getAppointmentDetail(appointmentId: number): Promise<{
    plate: string;
    model: string;
    serviceName: string;
    timeSlot: string;
    contact: string;
    remark: string | null;
    customerPhone: string;
    storePhone: string;
  } | null> {
    const appointment = await this.appointmentRepo.findOne({
      where: { id: Equal(appointmentId) },
    });
    if (appointment == null) return null;

    const [vehicle, service, customer, store] = await Promise.all([
      appointment.vehicleId != null
        ? this.vehicleRepo.findOne({ where: { id: Equal(appointment.vehicleId) } })
        : Promise.resolve(null),
      appointment.serviceId != null
        ? this.serviceRepo.findOne({ where: { id: Equal(appointment.serviceId) } })
        : Promise.resolve(null),
      this.customerRepo.findOne({ where: { id: Equal(appointment.customerId) } }),
      appointment.storeId != null
        ? this.storeRepo.findOne({ where: { id: Equal(appointment.storeId) } })
        : Promise.resolve(null),
    ]);

    const timeSlot =
      appointment.appointmentTime != null
        ? moment(appointment.appointmentTime).format('YYYY-MM-DD HH:mm')
        : '';
    const contact =
      customer != null
        ? `${customer.name ?? ''} ${(customer.phone ?? '').replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}`.trim()
        : '';

    return {
      plate: vehicle?.plateNumber ?? '—',
      model: vehicle?.model ?? vehicle?.brand ?? '—',
      serviceName: service?.name ?? '—',
      timeSlot,
      contact,
      remark: appointment.remark ?? null,
      customerPhone: customer?.phone ?? '',
      storePhone: store?.contactPhone ?? '',
    };
  }

  /**
   * 到店签到：为预约创建工单并记录签到时间，当前用户为技师
   */
  async signIn(appointmentId: number): Promise<{ workOrderId: number }> {
    const userId = this.ctx.user?.id;
    if (userId == null) {
      throw new CoolCommException('请先登录');
    }

    const appointment = await this.appointmentRepo.findOne({
      where: { id: Equal(appointmentId) },
    });
    if (appointment == null) {
      throw new CoolCommException('预约不存在');
    }

    const existing = await this.workOrderRepo.findOne({
      where: { appointmentId: Equal(appointmentId) },
    });
    if (existing != null) {
      return { workOrderId: existing.id };
    }

    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    const wo = await this.workOrderRepo.save({
      appointmentId: appointment.id,
      customerId: appointment.customerId,
      storeId: appointment.storeId,
      vehicleId: appointment.vehicleId,
      serviceId: appointment.serviceId,
      technicianId: userId,
      status: 0, // 已创建
      checkInTime: now as any,
      tenantId: appointment.tenantId ?? undefined,
    } as any);
    return { workOrderId: wo.id };
  }

  /**
   * 店长取消预约：仅待确认/待服务可取消，校验当前用户为同门店(tenantId)
   */
  async managerCancel(appointmentId: number): Promise<void> {
    const tenantId = this.getTenantId();
    if (tenantId == null) throw new CoolCommException('无门店权限');

    const appointment = await this.appointmentRepo.findOne({
      where: { id: Equal(appointmentId), tenantId: Equal(tenantId) },
    });
    if (appointment == null) throw new CoolCommException('预约不存在或无权操作');
    if (appointment.status !== 0 && appointment.status !== 1) throw new CoolCommException('当前状态不可取消');

    appointment.status = 2;
    await this.appointmentRepo.save(appointment);
  }

  /**
   * 店长改派技师：更新预约及关联工单的技师
   */
  async managerReassign(appointmentId: number, technicianId: number): Promise<void> {
    const tenantId = this.getTenantId();
    if (tenantId == null) throw new CoolCommException('无门店权限');

    const appointment = await this.appointmentRepo.findOne({
      where: { id: Equal(appointmentId), tenantId: Equal(tenantId) },
    });
    if (appointment == null) throw new CoolCommException('预约不存在或无权操作');
    const tech = await this.userInfoRepo.findOne({
      where: { id: Equal(technicianId), tenantId: Equal(tenantId) },
    });
    if (tech == null) throw new CoolCommException('请选择本门店技师');

    appointment.technicianId = technicianId;
    await this.appointmentRepo.save(appointment);

    const wo = await this.workOrderRepo.findOne({ where: { appointmentId: Equal(appointmentId) } });
    if (wo != null) {
      wo.technicianId = technicianId;
      await this.workOrderRepo.save(wo);
    }
  }

  /**
   * 店长端可选技师列表（同门店）
   */
  async getTechnicianList(): Promise<Array<{ id: number; name: string }>> {
    const tenantId = this.getTenantId();
    if (tenantId == null) return [];

    const users = await this.userInfoRepo.find({
      where: { tenantId: Equal(tenantId), status: Equal(1) },
      select: ['id', 'nickName'],
    });
    return users.map(u => ({ id: u.id, name: u.nickName ?? '—' }));
  }

  /**
   * 店长端员工列表（同门店，含今日接单数、角色）
   */
  async getStaffList(): Promise<
    Array<{ id: number; name: string; avatar: string; role: string; todayCount: number }>
  > {
    const tenantId = this.getTenantId();
    if (tenantId == null) return [];

    const { start, end } = this.getTodayRange();
    const workOrders = await this.workOrderRepo.find({
      where: { tenantId: Equal(tenantId) },
    });
    const todayWo = workOrders.filter(wo => {
      const t = String((wo as any).createTime ?? '');
      return t >= start && t <= end;
    });
    const countByTech = new Map<number, number>();
    todayWo.forEach(wo => {
      if (wo.technicianId != null) {
        countByTech.set(wo.technicianId, (countByTech.get(wo.technicianId) ?? 0) + 1);
      }
    });

    const users = await this.userInfoRepo.find({
      where: { tenantId: Equal(tenantId), status: Equal(1) },
      select: ['id', 'nickName', 'avatarUrl'],
    });

    const list: Array<{ id: number; name: string; avatar: string; role: string; todayCount: number }> = [];
    for (const u of users) {
      const access = await this.userAccountBindService.getRoleAccessByAppUserId(u.id);
      const role = access.isManager ? '店长' : '员工';
      list.push({
        id: u.id,
        name: u.nickName ?? '—',
        avatar: u.avatarUrl ?? '',
        role,
        todayCount: countByTech.get(u.id) ?? 0,
      });
    }
    list.sort((a, b) => b.todayCount - a.todayCount);
    return list;
  }

  /**
   * 店长端数据概览（当日营业额、单量、客单价、员工排行、热门服务）
   */
  async getManagerStats(): Promise<{
    revenue: string;
    orders: number;
    avgPrice: string;
    rankList: Array<{ id: number; name: string; count: number }>;
    topServices: Array<{ name: string; count: number }>;
  }> {
    const tenantId = this.getTenantId();
    if (tenantId == null) {
      return {
        revenue: '0',
        orders: 0,
        avgPrice: '0',
        rankList: [],
        topServices: [],
      };
    }

    const { start, end } = this.getTodayRange();
    const workOrders = await this.workOrderRepo.find({
      where: { tenantId: Equal(tenantId), status: Equal(2) },
    });
    const todayDone = workOrders.filter(wo => {
      const t = String((wo as any).createTime ?? '');
      return t >= start && t <= end;
    });

    const orders = todayDone.length;
    const revenue = '0'; // 工单暂无金额字段，预留
    const avgPrice = orders > 0 ? '0' : '0';

    const techCount = new Map<number, number>();
    const serviceCount = new Map<number, number>();
    todayDone.forEach(wo => {
      if (wo.technicianId != null) {
        techCount.set(wo.technicianId, (techCount.get(wo.technicianId) ?? 0) + 1);
      }
      if (wo.serviceId != null) {
        serviceCount.set(wo.serviceId, (serviceCount.get(wo.serviceId) ?? 0) + 1);
      }
    });

    const techIds = [...techCount.keys()];
    const serviceIds = [...serviceCount.keys()];
    const [users, services] = await Promise.all([
      techIds.length > 0 ? this.userInfoRepo.find({ where: { id: In(techIds) }, select: ['id', 'nickName'] }) : [],
      serviceIds.length > 0 ? this.serviceRepo.find({ where: { id: In(serviceIds) }, select: ['id', 'name'] }) : [],
    ]);
    const userMap = new Map(users.map(u => [u.id, u.nickName ?? '—']));
    const serviceMap = new Map(services.map(s => [s.id, s.name]));

    const rankList = techIds
      .map(id => ({ id, name: userMap.get(id) ?? '—', count: techCount.get(id) ?? 0 }))
      .sort((a, b) => b.count - a.count);
    const topServices = serviceIds
      .map(id => ({ name: serviceMap.get(id) ?? '—', count: serviceCount.get(id) ?? 0 }))
      .sort((a, b) => b.count - a.count);

    return {
      revenue,
      orders,
      avgPrice,
      rankList,
      topServices,
    };
  }
}
