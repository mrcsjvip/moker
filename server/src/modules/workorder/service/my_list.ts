import { Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Context } from '@midwayjs/koa';
import { Equal, In, Repository } from 'typeorm';
import * as moment from 'moment';
import { WorkOrderEntity } from '../entity/work_order';
import { WorkOrderStepEntity } from '../entity/work_order_step';
import { ServiceEntity } from '../../service/entity/service';
import { CustomerEntity } from '../../customer/entity/customer';

export type WorkOrderMyItem = {
  id: number;
  serviceName: string;
  statusText: string;
  statusType: string;
  time: string;
  steps: string[];
};

/**
 * C端-我的工单/质保
 */
@Provide()
export class WorkOrderMyListService {
  @Inject()
  ctx: Context;

  @InjectEntityModel(WorkOrderEntity)
  workOrderRepo: Repository<WorkOrderEntity>;

  @InjectEntityModel(WorkOrderStepEntity)
  stepRepo: Repository<WorkOrderStepEntity>;

  @InjectEntityModel(ServiceEntity)
  serviceRepo: Repository<ServiceEntity>;

  @InjectEntityModel(CustomerEntity)
  customerRepo: Repository<CustomerEntity>;

  async list(): Promise<WorkOrderMyItem[]> {
    const userId = this.ctx.user?.id;
    if (userId == null) return [];

    const customer = await this.customerRepo.findOne({
      where: { userId: Equal(userId) },
    });
    if (customer == null) return [];

    const workOrders = await this.workOrderRepo.find({
      where: { customerId: Equal(customer.id) },
      order: { updateTime: 'DESC' },
    });
    if (workOrders.length === 0) return [];

    const workOrderIds = workOrders.map(wo => wo.id);
    const serviceIds = [
      ...new Set(workOrders.map(wo => wo.serviceId).filter(Boolean)),
    ] as number[];

    const [steps, services] = await Promise.all([
      this.stepRepo.find({ where: { workOrderId: In(workOrderIds) } }),
      serviceIds.length > 0
        ? this.serviceRepo.find({ where: { id: In(serviceIds) } })
        : [],
    ]);

    const serviceMap = new Map<number, ServiceEntity>(
      services.map(s => [s.id, s] as [number, ServiceEntity])
    );

    const stepMap = new Map<number, WorkOrderStepEntity[]>();
    steps.forEach(step => {
      const list = stepMap.get(step.workOrderId) ?? [];
      list.push(step);
      stepMap.set(step.workOrderId, list);
    });

    const statusMap: Record<number, { text: string; type: string }> = {
      0: { text: '已创建', type: 'info' },
      1: { text: '施工中', type: 'warning' },
      2: { text: '已完成', type: 'success' },
      3: { text: '已归档', type: 'default' },
    };

    return workOrders.map(wo => {
      const status = statusMap[wo.status] ?? { text: '—', type: 'info' };
      const serviceName =
        wo.serviceId != null
          ? serviceMap.get(wo.serviceId)?.name ?? '—'
          : '—';
      const stepList = (stepMap.get(wo.id) ?? []).map(s => s.name);
      return {
        id: wo.id,
        serviceName,
        statusText: status.text,
        statusType: status.type,
        time: moment(wo.updateTime).format('YYYY-MM-DD HH:mm'),
        steps: stepList,
      };
    });
  }
}
