
import { Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Alarms } from "../screens";

const Tab = createBottomTabNavigator();
export function AppNavigation () {
    return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="alarms" component={Alarms} />
      </Tab.Navigator>
    </NavigationContainer>
    )
}