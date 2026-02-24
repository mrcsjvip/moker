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

  private async getCustomerId(): Promise<number | null> {
    const userId = this.ctx.user?.id;
    if (userId == null) return null;
    const customer = await this.customerRepo.findOne({
      where: { userId: Equal(userId) },
    });
    return customer?.id ?? null;
  }

  async list(): Promise<Array<{ id: number; plateNumber: string; brand: string; model: string; vin: string }>> {
    const customerId = await this.getCustomerId();
    if (customerId == null) return [];

    const vehicles = await this.vehicleRepo.find({
      where: { customerId: Equal(customerId) },
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

  async info(id: number): Promise<{ id: number; plateNumber: string; brand: string; model: string; vin: string } | null> {
    const customerId = await this.getCustomerId();
    if (customerId == null || id <= 0) return null;

    const v = await this.vehicleRepo.findOne({
      where: { id: Equal(id), customerId: Equal(customerId) },
    });
    if (v == null) return null;
    return {
      id: v.id,
      plateNumber: v.plateNumber ?? '—',
      brand: v.brand ?? '',
      model: v.model ?? '',
      vin: v.vin ?? '',
    };
  }

  async add(body: { plateNumber: string; brand?: string; model?: string; vin?: string }): Promise<{ id: number }> {
    const userId = this.ctx.user?.id;
    if (userId == null) throw new Error('请先登录');

    let customer = await this.customerRepo.findOne({ where: { userId: Equal(userId) } });
    if (customer == null) {
      customer = this.customerRepo.create({
        userId,
        name: '微信用户',
        phone: '',
      });
      await this.customerRepo.save(customer);
    }

    const plateNumber = (body.plateNumber ?? '').trim();
    if (!plateNumber) throw new Error('请输入车牌号');

    const existing = await this.vehicleRepo.findOne({
      where: { customerId: Equal(customer.id), plateNumber },
    });
    if (existing) throw new Error('该车牌已存在');

    const vehicle = this.vehicleRepo.create({
      customerId: customer.id,
      plateNumber,
      brand: body.brand?.trim() || undefined,
      model: body.model?.trim() || undefined,
      vin: body.vin?.trim() || undefined,
    });
    await this.vehicleRepo.save(vehicle);
    return { id: vehicle.id };
  }

  async update(
    id: number,
    body: { plateNumber?: string; brand?: string; model?: string; vin?: string }
  ): Promise<void> {
    const customerId = await this.getCustomerId();
    if (customerId == null || id <= 0) throw new Error('无权操作');

    const vehicle = await this.vehicleRepo.findOne({
      where: { id: Equal(id), customerId: Equal(customerId) },
    });
    if (vehicle == null) throw new Error('车辆不存在');

    if (body.plateNumber != null) {
      const plateNumber = String(body.plateNumber).trim();
      if (!plateNumber) throw new Error('车牌号不能为空');
      const existing = await this.vehicleRepo.findOne({
        where: { customerId: Equal(customerId), plateNumber },
      });
      if (existing != null && existing.id !== id) throw new Error('该车牌已存在');
      vehicle.plateNumber = plateNumber;
    }
    if (body.brand !== undefined) vehicle.brand = body.brand?.trim() || undefined;
    if (body.model !== undefined) vehicle.model = body.model?.trim() || undefined;
    if (body.vin !== undefined) vehicle.vin = body.vin?.trim() || undefined;
    await this.vehicleRepo.save(vehicle);
  }

  async delete(id: number): Promise<void> {
    const customerId = await this.getCustomerId();
    if (customerId == null || id <= 0) throw new Error('无权操作');

    const vehicle = await this.vehicleRepo.findOne({
      where: { id: Equal(id), customerId: Equal(customerId) },
    });
    if (vehicle == null) throw new Error('车辆不存在');
    await this.vehicleRepo.remove(vehicle);
  }
}
