import type { Appliance } from '../types/appliance';

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type AppStackParamList = {
  ApplianceList: undefined;
  ApplianceDetail: { appliance: Appliance };
  ApplianceForm: { appliance?: Appliance } | undefined;
  Profile: undefined;
};
