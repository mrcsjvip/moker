import { Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Context } from '@midwayjs/koa';
import { Equal, Repository } from 'typeorm';
import { VehicleEntity } from '../entity/vehicle';
import { CustomerEntity } from '../../customer/entity/customer';

/**
 * C端-我的车辆
 */
@Provide()
export class VehicleMyListService {
  @Inject()
  ctx: Context;

  @InjectEntityModel(VehicleEntity)
  vehicleRepo: Repository<VehicleEntity>;

  @InjectEntityModel(CustomerEntity)
  customerRepo: Repository<CustomerEntity>;

  async list(): Promise<Array<{ id: number; plateNumber: string; brand: string; model: string; vin: string }>> {
    const userId = this.ctx.user?.id;
    if (userId == null) return [];

    const customer = await this.customerRepo.findOne({
      where: { userId: Equal(userId) },
    });
    if (customer == null) return [];

    const vehicles = await this.vehicleRepo.find({
      where: { customerId: Equal(customer.id) },
      order: { createTime: 'DESC' },
    });
    return vehicles.map(v => ({
      id: v.id,
      plateNumber: v.plateNumber ?? '—',
      brand: v.brand ?? '',
      model: v.model ?? '',
      vin: v.vin ?? '',
    }));
  }
}
