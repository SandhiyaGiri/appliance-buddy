import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import type { AppStackParamList, AuthStackParamList } from './types';
import { SignInScreen } from '../screens/Auth/SignInScreen';
import { SignUpScreen } from '../screens/Auth/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/Auth/ForgotPasswordScreen';
import { ApplianceListScreen } from '../screens/App/ApplianceListScreen';
import { ApplianceDetailScreen } from '../screens/App/ApplianceDetailScreen';
import { ApplianceFormScreen } from '../screens/App/ApplianceFormScreen';
import { ProfileScreen } from '../screens/App/ProfileScreen';

const Auth = createNativeStackNavigator<AuthStackParamList>();
const App = createNativeStackNavigator<AppStackParamList>();

const AuthNavigator = () => (
  <Auth.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Auth.Screen name="SignIn" component={SignInScreen} />
    <Auth.Screen name="SignUp" component={SignUpScreen} />
    <Auth.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Auth.Navigator>
);

const AppNavigator = () => (
  <App.Navigator
    screenOptions={{
      headerTitleAlign: 'center',
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: '#f5f7ff',
      },
    }}
  >
    <App.Screen name="ApplianceList" component={ApplianceListScreen} options={{ title: 'Appliance Buddy' }} />
    <App.Screen name="ApplianceDetail" component={ApplianceDetailScreen} options={{ title: 'Details' }} />
    <App.Screen
      name="ApplianceForm"
      component={ApplianceFormScreen}
      options={{
        presentation: 'modal',
        title: 'Appliance',
      }}
    />
    <App.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
  </App.Navigator>
);

export const RootNavigator = () => {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f7ff',
  },
});
