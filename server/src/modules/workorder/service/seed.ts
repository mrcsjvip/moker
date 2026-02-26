import { Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import * as moment from 'moment';
import { WorkOrderEntity } from '../entity/work_order';
import { WorkOrderStepEntity } from '../entity/work_order_step';
import { CustomerEntity } from '../../customer/entity/customer';
import { ServiceEntity } from '../../service/entity/service';
import { VehicleEntity } from '../../vehicle/entity/vehicle';

@Provide()
export class WorkOrderSeedService {
  @InjectEntityModel(CustomerEntity)
  customerRepo: Repository<CustomerEntity>;

  @InjectEntityModel(ServiceEntity)
  serviceRepo: Repository<ServiceEntity>;

  @InjectEntityModel(VehicleEntity)
  vehicleRepo: Repository<VehicleEntity>;

  @InjectEntityModel(WorkOrderEntity)
  workOrderRepo: Repository<WorkOrderEntity>;

  @InjectEntityModel(WorkOrderStepEntity)
  stepRepo: Repository<WorkOrderStepEntity>;

  async createSample(): Promise<{ workOrderId: number }> {
    const phone = '18000000000';
    let customer = await this.customerRepo.findOne({ where: { phone } });
    if (!customer) {
      customer = await this.customerRepo.save({
        name: '测试客户',
        phone,
        remark: '自动生成测试客户',
      });
    }

    let service = await this.serviceRepo.findOne({ where: { name: '隐形车衣' } });
    if (!service) {
      service = await this.serviceRepo.save({
        name: '隐形车衣',
        guidePrice: 1980,
        duration: 180,
        description: '自动生成测试服务',
      });
    }

    let vehicle = await this.vehicleRepo.findOne({
      where: { customerId: customer.id, plateNumber: '粤B12345' },
    });
    if (!vehicle) {
      vehicle = await this.vehicleRepo.save({
        customerId: customer.id,
        plateNumber: '粤B12345',
        brand: 'Tesla',
        model: 'Model 3',
      });
    }

    const existing = await this.workOrderRepo.findOne({
      where: { customerId: customer.id, serviceId: service.id },
    });
    if (existing) {
      return { workOrderId: existing.id };
    }

    const workOrder = await this.workOrderRepo.save({
      customerId: customer.id,
      serviceId: service.id,
      vehicleId: vehicle.id,
      status: 1,
      checkInTime: moment().format('YYYY-MM-DD HH:mm:ss') as any,
      remark: '自动生成测试工单',
    });

    const steps = ['进店检车', '施工中', '质检中'];
    await this.stepRepo.save(
      steps.map((name, idx) => ({
        workOrderId: workOrder.id,
        name,
        status: idx === 0 ? 1 : 0,
        finishedTime:
          idx === 0 ? (moment().format('YYYY-MM-DD HH:mm:ss') as any) : null,
      }))
    );

    return { workOrderId: workOrder.id };
  }
}
