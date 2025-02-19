export type AuthStackParamList = {
  login: undefined;
  signup: undefined;
  "reset-password": undefined;
};

export type TabsStackParamList = {
  home: undefined;
  profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends AuthStackParamList, TabsStackParamList {}
  }
}

const navigationTypes = {
  AuthStackParamList: {} as AuthStackParamList,
  TabsStackParamList: {} as TabsStackParamList,
};

export default navigationTypes;
