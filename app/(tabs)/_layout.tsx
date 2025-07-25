import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

import { useClientOnlyValue } from '@/src/hooks/useClientOnlyValue';
import { useCart } from '@/src/context/CartContext';
import { UserModeProvider } from '@/src/contexts/UserModeContext';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

function CartTabBarIcon({ color }: { color: string }) {
  const { state } = useCart();

  return (
    <View style={styles.cartIconContainer}>
      <TabBarIcon name="shopping-cart" color={color} />
      {state.totalItems > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{state.totalItems > 99 ? '99+' : state.totalItems}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  return (
    <UserModeProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#386B5F',
          tabBarInactiveTintColor: '#A0A4A8',
          tabBarLabelStyle: { fontSize: 16, fontWeight: '500', marginBottom: 4 },
          tabBarStyle: { borderTopColor: '#E6E6E6', borderTopWidth: 1, height: 70 },
          headerShown: useClientOnlyValue(false, true),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: 'Cart',
            tabBarIcon: ({ color }) => <CartTabBarIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            title: 'Messages',
            tabBarIcon: ({ color }) => <TabBarIcon name="comment-o" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <TabBarIcon name="user-o" color={color} />,
          }}
        />
      </Tabs>
    </UserModeProvider>
  );
}

const styles = StyleSheet.create({
  cartIconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -12,
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
