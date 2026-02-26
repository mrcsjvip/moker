import { Provide, Inject } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Context } from '@midwayjs/koa';
import { Equal, In, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment';
import { CoolCommException } from '@cool-midway/core';
import { UserCouponEntity } from '../entity/user_coupon';
import { CouponEntity } from '../entity/coupon';
import { CouponUseEntity } from '../entity/coupon_use';
import { CustomerEntity } from '../../customer/entity/customer';

/**
 * 用户优惠券：领取、我的列表、核销
 */
@Provide()
export class MarketingUserCouponService {
  @InjectEntityModel(UserCouponEntity)
  userCouponRepo: Repository<UserCouponEntity>;

  @InjectEntityModel(CouponEntity)
  couponRepo: Repository<CouponEntity>;

  @InjectEntityModel(CouponUseEntity)
  couponUseRepo: Repository<CouponUseEntity>;

  @InjectEntityModel(CustomerEntity)
  customerRepo: Repository<CustomerEntity>;

  @Inject()
  ctx: Context;

  /** 生成核销码（12位） */
  private genCode(): string {
    return uuidv4().replace(/-/g, '').slice(0, 12).toUpperCase();
  }

  /**
   * C端：领取优惠券（需登录，按 customerId = 当前用户）
   */
  async receive(couponId: number): Promise<{ id: number; code: string }> {
    const userId = (this.ctx as any).user?.id;
    if (userId == null) throw new CoolCommException('请先登录');

    const customer = await this.customerRepo.findOne({ where: { userId: Equal(userId) } });
    if (customer == null) throw new CoolCommException('未绑定客户信息');

    const coupon = await this.couponRepo.findOne({ where: { id: Equal(couponId) } });
    if (coupon == null) throw new CoolCommException('优惠券不存在');
    if (coupon.status !== 1) throw new CoolCommException('该优惠券已停用');

    const now = moment();
    if (coupon.startTime && moment(coupon.startTime).isAfter(now))
      throw new CoolCommException('未到可使用时间');
    if (coupon.endTime && moment(coupon.endTime).isBefore(now))
      throw new CoolCommException('优惠券已过期');

    const existing = await this.userCouponRepo.findOne({
      where: {
        couponId: Equal(couponId),
        customerId: Equal(customer.id),
        status: Equal(0),
      },
    });
    if (existing) throw new CoolCommException('您已领取过该券，请勿重复领取');

    const code = this.genCode();
    const row = await this.userCouponRepo.save({
      couponId: coupon.id,
      customerId: customer.id,
      code,
      status: 0,
      receiveTime: now.toDate(),
      tenantId: coupon.tenantId,
    });
    return { id: row.id, code };
  }

  /**
   * C端：可领取的优惠券列表（未领取的、启用且在有效期内的券）
   */
  async availableList(): Promise<
    Array<{
      id: number;
      name: string;
      type: number;
      value: number;
      minSpend: number;
      startTime: string | null;
      endTime: string | null;
    }>
  > {
    const userId = (this.ctx as any).user?.id;
    if (userId == null) return [];

    const customer = await this.customerRepo.findOne({ where: { userId: Equal(userId) } });
    if (customer == null) return [];

    const now = moment();
    const coupons = await this.couponRepo.find({
      where: { status: Equal(1) },
      order: { createTime: 'DESC' },
    });
    const receivedIds = await this.userCouponRepo.find({
      where: { customerId: Equal(customer.id) },
      select: ['couponId'],
    });
    const receivedSet = new Set(receivedIds.map((r) => r.couponId));

    return coupons
      .filter((c) => {
        if (receivedSet.has(c.id)) return false;
        if (c.startTime && moment(c.startTime).isAfter(now)) return false;
        if (c.endTime && moment(c.endTime).isBefore(now)) return false;
        return true;
      })
      .map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        value: Number(c.value),
        minSpend: Number(c.minSpend),
        startTime: c.startTime ? moment(c.startTime).format('YYYY-MM-DD') : null,
        endTime: c.endTime ? moment(c.endTime).format('YYYY-MM-DD') : null,
      }));
  }

  /**
   * C端：我的优惠券列表（未使用/已使用/已过期）
   */
  async myList(status?: number): Promise<
    Array<{
      id: number;
      code: string;
      status: number;
      receiveTime: string;
      usedTime: string | null;
      couponName: string;
      couponType: number;
      value: number;
      minSpend: number;
      startTime: string | null;
      endTime: string | null;
    }>
  > {
    const userId = (this.ctx as any).user?.id;
    if (userId == null) return [];

    const customer = await this.customerRepo.findOne({ where: { userId: Equal(userId) } });
    if (customer == null) return [];

    const where: any = { customerId: Equal(customer.id) };
    if (status != null) where.status = Equal(status);

    const list = await this.userCouponRepo.find({
      where,
      order: { receiveTime: 'DESC' },
    });
    if (list.length === 0) return [];

    const couponIds = [...new Set(list.map((u) => u.couponId))];
    const coupons = await this.couponRepo.find({ where: { id: In(couponIds) } });
    const couponMap = new Map(coupons.map((c) => [c.id, c]));

    return list.map((u) => {
      const c = couponMap.get(u.couponId);
      return {
        id: u.id,
        code: u.code,
        status: u.status,
        receiveTime: moment(u.receiveTime).format('YYYY-MM-DD HH:mm'),
        usedTime: u.usedTime ? moment(u.usedTime).format('YYYY-MM-DD HH:mm') : null,
        couponName: c?.name ?? '—',
        couponType: c?.type ?? 0,
        value: Number(c?.value ?? 0),
        minSpend: Number(c?.minSpend ?? 0),
        startTime: c?.startTime ? moment(c.startTime).format('YYYY-MM-DD') : null,
        endTime: c?.endTime ? moment(c.endTime).format('YYYY-MM-DD') : null,
      };
    });
  }

  /**
   * 员工/店长：核销优惠券（按核销码）
   * @param code 用户券的核销码
   * @param storeId 当前门店ID（核销门店）
   */
  async verify(code: string, storeId?: number): Promise<{ success: boolean; message: string; couponName?: string }> {
    const operatorId = (this.ctx as any).user?.id;
    if (operatorId == null) throw new CoolCommException('请先登录');

    const codeTrim = String(code || '').trim().toUpperCase();
    if (codeTrim.length === 0) throw new CoolCommException('请输入核销码');

    const userCoupon = await this.userCouponRepo.findOne({
      where: { code: Equal(codeTrim) },
    });
    if (userCoupon == null) {
      return { success: false, message: '核销码无效或不存在' };
    }
    if (userCoupon.status === 1) {
      return { success: false, message: '该券已核销，无法重复使用' };
    }
    if (userCoupon.status === 2) {
      return { success: false, message: '该券已过期' };
    }

    const coupon = await this.couponRepo.findOne({ where: { id: Equal(userCoupon.couponId) } });
    if (coupon == null) {
      return { success: false, message: '优惠券模板不存在' };
    }
    const now = moment();
    if (coupon.endTime && moment(coupon.endTime).isBefore(now)) {
      await this.userCouponRepo.update(userCoupon.id, { status: 2 });
      return { success: false, message: '优惠券已过期' };
    }

    const usedTime = now.toDate();
    const timeStr = now.format('YYYY-MM-DD HH:mm:ss');
    await this.userCouponRepo.update(userCoupon.id, {
      status: 1,
      usedTime,
      usedStoreId: storeId ?? null,
      usedOperatorId: operatorId,
    });
    await this.couponUseRepo.save(
      this.couponUseRepo.create({
        couponId: userCoupon.couponId,
        customerId: userCoupon.customerId,
        usedTime,
        storeId: storeId ?? undefined,
        operatorId: operatorId,
        tenantId: userCoupon.tenantId,
        createTime: timeStr as any,
        updateTime: timeStr as any,
      })
    );

    return {
      success: true,
      message: '核销成功',
      couponName: coupon.name,
    };
  }
}
