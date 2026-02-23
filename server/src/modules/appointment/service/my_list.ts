import { Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Context } from '@midwayjs/koa';
import { Equal, In, Repository } from 'typeorm';
import * as moment from 'moment';
import { AppointmentEntity } from '../entity/appointment';
import { CustomerEntity } from '../../customer/entity/customer';
import { VehicleEntity } from '../../vehicle/entity/vehicle';
import { StoreEntity } from '../../store/entity/store';
import { ServiceEntity } from '../../service/entity/service';

/**
 * C端-我的预约列表
 */
@Provide()
export class AppointmentMyListService {
  @Inject()
  ctx: Context;

  @InjectEntityModel(AppointmentEntity)
  appointmentRepo: Repository<AppointmentEntity>;

  @InjectEntityModel(CustomerEntity)
  customerRepo: Repository<CustomerEntity>;

  @InjectEntityModel(VehicleEntity)
  vehicleRepo: Repository<VehicleEntity>;

  @InjectEntityModel(StoreEntity)
  storeRepo: Repository<StoreEntity>;

  @InjectEntityModel(ServiceEntity)
  serviceRepo: Repository<ServiceEntity>;

  /**
   * 当前用户的预约列表（按 customer.userId = 当前用户）
   */
  async list(tab: string): Promise<
    Array<{
      id: number;
      serviceName: string;
      storeName: string;
      dateTime: string;
      statusText: string;
      statusType: string;
      canCancel: boolean;
      canReorder: boolean;
    }>
  > {
    const userId = this.ctx.user?.id;
    if (userId == null) return [];

    const customer = await this.customerRepo.findOne({
      where: { userId: Equal(userId) },
    });
    if (customer == null) return [];

    const appointments = await this.appointmentRepo.find({
      where: { customerId: Equal(customer.id) },
      order: { appointmentTime: 'DESC' },
    });

    if (appointments.length === 0) return [];

    const storeIds = [...new Set(appointments.map(a => a.storeId).filter(Boolean))] as number[];
    const serviceIds = [...new Set(appointments.map(a => a.serviceId).filter(Boolean))] as number[];

    const [stores, services] = await Promise.all([
      storeIds.length > 0 ? this.storeRepo.find({ where: { id: In(storeIds) } }) : [],
      serviceIds.length > 0 ? this.serviceRepo.find({ where: { id: In(serviceIds) } }) : [],
    ]);
    const storeMap = new Map(stores.map(s => [s.id, s]));
    const serviceMap = new Map(services.map(s => [s.id, s]));

    const statusMap: Record<number, { text: string; type: string }> = {
      0: { text: '待确认', type: 'warning' },
      1: { text: '待服务', type: 'primary' },
      2: { text: '已取消', type: 'info' },
      3: { text: '已完成', type: 'success' },
    };

    const result = appointments
      .filter(a => {
        if (tab === 'all') return true;
        if (tab === 'pending') return a.status === 1;
        if (tab === 'done') return a.status === 3;
        if (tab === 'cancelled') return a.status === 2;
        return true;
      })
      .map(a => {
        const st = statusMap[a.status] ?? { text: '—', type: 'info' };
        const canCancel = a.status === 1;
        const canReorder = a.status === 2 || a.status === 3;
        return {
          id: a.id,
          serviceName: (a.serviceId != null ? serviceMap.get(a.serviceId)?.name : null) ?? '—',
          storeName: (a.storeId != null ? storeMap.get(a.storeId)?.name : null) ?? '—',
          dateTime: moment(a.appointmentTime).format('YYYY-MM-DD HH:mm'),
          statusText: st.text,
          statusType: st.type,
          canCancel,
          canReorder,
        };
    });

    return result;
  }

  /**
   * 解析日期+时段为 Date
   */
  private parseAppointmentTime(dateStr: string, timeSlot: string): Date {
    const d = moment(dateStr, 'YYYY-MM-DD');
    if (!d.isValid()) return new Date();
    if (timeSlot && timeSlot.includes('上午')) {
      d.hour(9).minute(0).second(0).millisecond(0);
    } else if (timeSlot && timeSlot.includes('下午')) {
      d.hour(14).minute(0).second(0).millisecond(0);
    } else {
      const m = timeSlot?.match(/(\d{1,2}):(\d{2})/);
      if (m) {
        d.hour(parseInt(m[1], 10)).minute(parseInt(m[2], 10)).second(0).millisecond(0);
      } else {
        d.hour(9).minute(0).second(0).millisecond(0);
      }
    }
    return d.toDate();
  }

  /**
   * C端提交预约：创建/更新客户与车辆，创建预约
   */
  async submit(body: {
    storeId: number;
    serviceId: number;
    date: string;
    timeSlot: string;
    plateNumber: string;
    vin?: string;
    model?: string;
    remark?: string;
    name?: string;
    phone?: string;
  }): Promise<{ id: number }> {
    const userId = this.ctx.user?.id;
    if (userId == null) throw new Error('请先登录');

    const { storeId, serviceId, date, timeSlot, plateNumber, vin, model, remark, name, phone } = body;
    if (!storeId || !serviceId || !date || !timeSlot || !plateNumber?.trim()) {
      throw new Error('请填写门店、服务、日期、时段和车牌号');
    }

    let customer = await this.customerRepo.findOne({ where: { userId: Equal(userId) } });
    if (customer == null) {
      customer = this.customerRepo.create({
        userId,
        name: name?.trim() || '微信用户',
        phone: phone?.trim() || '',
      });
      await this.customerRepo.save(customer);
    } else {
      if (name?.trim()) customer.name = name.trim();
      if (phone?.trim()) customer.phone = phone.trim();
      await this.customerRepo.save(customer);
    }

    let vehicle = await this.vehicleRepo.findOne({
      where: { customerId: Equal(customer.id), plateNumber: plateNumber.trim() },
    });
    if (vehicle == null) {
      vehicle = this.vehicleRepo.create({
        customerId: customer.id,
        plateNumber: plateNumber.trim(),
        vin: vin?.trim() || undefined,
        model: model?.trim() || undefined,
      });
      await this.vehicleRepo.save(vehicle);
    } else {
      if (vin != null) vehicle.vin = vin.trim() || undefined;
      if (model != null) vehicle.model = model.trim() || undefined;
      await this.vehicleRepo.save(vehicle);
    }

    const appointmentTime = this.parseAppointmentTime(date, timeSlot);
    const appointment = this.appointmentRepo.create({
      customerId: customer.id,
      storeId,
      serviceId,
      vehicleId: vehicle.id,
      appointmentTime,
      status: 0,
      remark: remark?.trim() || undefined,
    });
    await this.appointmentRepo.save(appointment);
    return { id: appointment.id };
  }

  /**
   * C端预约详情（仅本人）
   */
  async getDetail(id: number): Promise<{
    id: number;
    serviceName: string;
    storeName: string;
    dateTime: string;
    vehicle: string;
    contact: string;
    amount: string;
    status: number;
  } | null> {
    const userId = this.ctx.user?.id;
    if (userId == null || id == null) return null;

    const customer = await this.customerRepo.findOne({ where: { userId: Equal(userId) } });
    if (customer == null) return null;

    const appointment = await this.appointmentRepo.findOne({ where: { id: Equal(id), customerId: Equal(customer.id) } });
    if (appointment == null) return null;

    const [store, service, vehicle] = await Promise.all([
      appointment.storeId != null ? this.storeRepo.findOne({ where: { id: Equal(appointment.storeId) } }) : null,
      appointment.serviceId != null ? this.serviceRepo.findOne({ where: { id: Equal(appointment.serviceId) } }) : null,
      appointment.vehicleId != null ? this.vehicleRepo.findOne({ where: { id: Equal(appointment.vehicleId) } }) : null,
    ]);

    const vehicleText = vehicle
      ? `${vehicle.plateNumber}${vehicle.model ? ' / ' + vehicle.model : ''}`
      : '—';
    const contact = `${customer.name} ${customer.phone}`;
    const amount = service?.guidePrice != null ? String(service.guidePrice) : '待定';

    return {
      id: appointment.id,
      serviceName: service?.name ?? '—',
      storeName: store?.name ?? '—',
      dateTime: moment(appointment.appointmentTime).format('YYYY-MM-DD HH:mm'),
      vehicle: vehicleText,
      contact,
      amount,
      status: appointment.status,
    };
  }

  /**
   * C端确认预约：将状态改为已确认(1)
   */
  async confirm(id: number): Promise<void> {
    const userId = this.ctx.user?.id;
    if (userId == null || id == null) throw new Error('请先登录');

    const customer = await this.customerRepo.findOne({ where: { userId: Equal(userId) } });
    if (customer == null) throw new Error('客户信息不存在');

    const appointment = await this.appointmentRepo.findOne({ where: { id: Equal(id), customerId: Equal(customer.id) } });
    if (appointment == null) throw new Error('预约不存在');
    if (appointment.status !== 0) throw new Error('当前状态不可确认');

    appointment.status = 1;
    await this.appointmentRepo.save(appointment);
  }

  /**
   * C端取消预约：将状态改为已取消(2)，仅待确认(0)或待服务(1)可取消
   */
  async cancel(id: number): Promise<void> {
    const userId = this.ctx.user?.id;
    if (userId == null || id == null) throw new Error('请先登录');

    const customer = await this.customerRepo.findOne({ where: { userId: Equal(userId) } });
    if (customer == null) throw new Error('客户信息不存在');

    const appointment = await this.appointmentRepo.findOne({ where: { id: Equal(id), customerId: Equal(customer.id) } });
    if (appointment == null) throw new Error('预约不存在');
    if (appointment.status !== 0 && appointment.status !== 1) throw new Error('当前状态不可取消');

    appointment.status = 2;
    await this.appointmentRepo.save(appointment);
  }
}
