import { Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Context } from '@midwayjs/koa';
import { Equal, In, Repository } from 'typeorm';
import * as moment from 'moment';
import { WorkOrderEntity } from '../entity/work_order';
import { WorkOrderStepEntity } from '../entity/work_order_step';
import { VehicleEntity } from '../../vehicle/entity/vehicle';
import { ServiceEntity } from '../../service/entity/service';
import { CustomerEntity } from '../../customer/entity/customer';

export type EmployeeWorkOrderItem = {
  id: number;
  plate: string;
  serviceName: string;
  status: number;
  statusText: string;
  stepName: string;
  appointmentId: number | null;
};

/**
 * 员工端工单列表（当前技师、进行中）
 */
@Provide()
export class WorkOrderEmployeeListService {
  @Inject()
  ctx: Context;

  @InjectEntityModel(WorkOrderEntity)
  workOrderRepo: Repository<WorkOrderEntity>;

  @InjectEntityModel(WorkOrderStepEntity)
  stepRepo: Repository<WorkOrderStepEntity>;

  @InjectEntityModel(VehicleEntity)
  vehicleRepo: Repository<VehicleEntity>;

  @InjectEntityModel(ServiceEntity)
  serviceRepo: Repository<ServiceEntity>;

  @InjectEntityModel(CustomerEntity)
  customerRepo: Repository<CustomerEntity>;

  /**
   * 进行中工单列表（technicianId = 当前用户，status 0 或 1）
   */
  async list(): Promise<EmployeeWorkOrderItem[]> {
    const userId = this.ctx.user?.id;
    if (userId == null) return [];

    const orders = await this.workOrderRepo.find({
      where: [
        { technicianId: Equal(userId), status: Equal(0) },
        { technicianId: Equal(userId), status: Equal(1) },
      ],
      order: { createTime: 'DESC' },
    });

    if (orders.length === 0) return [];

    const vehicleIds = [...new Set(orders.map(o => o.vehicleId).filter(Boolean))] as number[];
    const serviceIds = [...new Set(orders.map(o => o.serviceId).filter(Boolean))] as number[];
    const workOrderIds = orders.map(o => o.id);

    const vehicles = vehicleIds.length > 0
      ? await this.vehicleRepo.find({ where: { id: In(vehicleIds) } })
      : [];
    const services = serviceIds.length > 0
      ? await this.serviceRepo.find({ where: { id: In(serviceIds) } })
      : [];
    const steps = await this.stepRepo.find({
      where: { workOrderId: In(workOrderIds) },
      order: { id: 'ASC' },
    });

    const vehicleMap = new Map(vehicles.map(v => [v.id, v]));
    const serviceMap = new Map(services.map(s => [s.id, s]));
    const stepsByWo = new Map<number, WorkOrderStepEntity[]>();
    steps.forEach(s => {
      const arr = stepsByWo.get(s.workOrderId) ?? [];
      arr.push(s);
      stepsByWo.set(s.workOrderId, arr);
    });

    const statusTextMap: Record<number, string> = {
      0: '已创建',
      1: '施工中',
      2: '已完成',
      3: '归档',
    };

    return orders.map(wo => {
      const woSteps = stepsByWo.get(wo.id) ?? [];
      const currentStep = woSteps.find(s => s.status === 0) ?? woSteps[woSteps.length - 1];
      const vehicle = wo.vehicleId != null ? vehicleMap.get(wo.vehicleId) : null;
      const service = wo.serviceId != null ? serviceMap.get(wo.serviceId) : null;
      return {
        id: wo.id,
        plate: vehicle?.plateNumber ?? '—',
        serviceName: service?.name ?? '—',
        status: wo.status,
        statusText: statusTextMap[wo.status] ?? '施工中',
        stepName: currentStep?.name ?? '—',
        appointmentId: wo.appointmentId ?? null,
      };
    });
  }

  /**
   * 员工本月统计（完成单数、提成、好评率）
   */
  async stats(): Promise<{
    monthCount: number;
    commission: string;
    rating: number;
  }> {
    const userId = this.ctx.user?.id;
    if (userId == null) {
      return { monthCount: 0, commission: '0', rating: 0 };
    }

    const monthStart = moment().startOf('month').format('YYYY-MM-DD HH:mm:ss');
    const monthEnd = moment().endOf('month').format('YYYY-MM-DD HH:mm:ss');

    const list = await this.workOrderRepo.find({
      where: {
        technicianId: Equal(userId),
        status: Equal(2),
      },
    });
    const monthCount = list.filter(wo => {
      const t = String((wo as any).createTime ?? '');
      return t >= monthStart && t <= monthEnd;
    }).length;

    return {
      monthCount,
      commission: '0', // 预留，后续从提成规则计算
      rating: 0, // 预留，后续从评价汇总
    };
  }

  /**
   * 工单详情（执行页：车牌、服务、步骤列表与当前进度）
   */
  async detail(workOrderId: number): Promise<{
    order: { plate: string; serviceName: string; customer: string };
    steps: Array<{ name: string; status: number }>;
    currentStepIndex: number;
    progressValue: number;
    isLastStep: boolean;
  } | null> {
    const userId = this.ctx.user?.id;
    if (userId == null) return null;

    const wo = await this.workOrderRepo.findOne({
      where: { id: Equal(workOrderId), technicianId: Equal(userId) },
    });
    if (wo == null) return null;

    const stepList = await this.stepRepo.find({
      where: { workOrderId: Equal(workOrderId) },
      order: { id: 'ASC' },
    });

    const vehicle =
      wo.vehicleId != null
        ? await this.vehicleRepo.findOne({ where: { id: Equal(wo.vehicleId) } })
        : null;
    const service =
      wo.serviceId != null
        ? await this.serviceRepo.findOne({ where: { id: Equal(wo.serviceId) } })
        : null;

    let customerName = '—';
    if (wo.customerId != null) {
      const c = await this.customerRepo.findOne({ where: { id: Equal(wo.customerId) } });
      if (c != null) {
        const n = String(c.name ?? '');
        customerName = n.length > 0 ? n.substring(0, 1) + '**' : '—';
      }
    }

    const steps = stepList.map(s => ({ name: s.name, status: s.status }));
    const currentStepIndex = stepList.findIndex(s => s.status === 0);
    const idx = currentStepIndex >= 0 ? currentStepIndex : stepList.length - 1;
    const progressValue = stepList.length > 0 ? Math.round((idx / stepList.length) * 100) : 0;
    const isLastStep = stepList.length > 0 && idx >= stepList.length - 1 && stepList[stepList.length - 1].status === 1;

    return {
      order: {
        plate: vehicle?.plateNumber ?? '—',
        serviceName: service?.name ?? '—',
        customer: customerName,
      },
      steps,
      currentStepIndex: idx,
      progressValue,
      isLastStep,
    };
  }

  /**
   * 完成当前步骤（将第一个待完成步骤标为已完成）
   */
  async finishStep(workOrderId: number): Promise<{ ok: boolean }> {
    const userId = this.ctx.user?.id;
    if (userId == null) return { ok: false };

    const wo = await this.workOrderRepo.findOne({
      where: { id: Equal(workOrderId), technicianId: Equal(userId) },
    });
    if (wo == null) return { ok: false };

    const next = await this.stepRepo.findOne({
      where: { workOrderId: Equal(workOrderId), status: Equal(0) },
      order: { id: 'ASC' },
    });
    if (next == null) return { ok: true };

    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    await this.stepRepo.update(
      { id: Equal(next.id) },
      { status: 1, finishedTime: now as any }
    );
    return { ok: true };
  }

  /**
   * 工单全部完成，提交质检（工单状态改为已完成）
   */
  async finishQuality(workOrderId: number): Promise<{ ok: boolean }> {
    const userId = this.ctx.user?.id;
    if (userId == null) return { ok: false };

    const wo = await this.workOrderRepo.findOne({
      where: { id: Equal(workOrderId), technicianId: Equal(userId) },
    });
    if (wo == null) return { ok: false };

    await this.workOrderRepo.update(
      { id: Equal(workOrderId) },
      { status: 2 }
    );
    return { ok: true };
  }
</think>
改为在 workorder 的 employee 中注入 Customer 并实现 detail。
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
Read
