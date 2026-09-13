import type { OtpPurpose } from '../features/auth/types/auth.types';

export type RootStackParamList = {
  Welcome: undefined;
  MobileNumber: { mode: 'login' | 'register' };
  Otp: { mobileNumber: string; purpose: OtpPurpose; mode: 'register' | 'forgotPassword' };
  LoginPassword: { mobileNumber: string };
  CreatePassword: { verificationToken: string; mobileNumber: string; mode: 'register' | 'reset' };
  ProfileBasics: undefined;

  ChooseLocation: undefined;
  ConfirmLocation: undefined;
  SaveAddress: undefined;

  MainTabs: undefined;

  SubCategory: { categoryId: string; categoryName: string };
  ProductDetails: { productId: string };
  OrderSummary: { orderId: string };

  WebViewScreen: { url: string; title: string };
  NoInternet: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
};
