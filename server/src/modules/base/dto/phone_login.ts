import { Rule, RuleType } from '@midwayjs/validate';

export class PhoneLoginDTO {
  @Rule(RuleType.string().required())
  phone: string;

  @Rule(RuleType.string().required())
  code: string;
}
