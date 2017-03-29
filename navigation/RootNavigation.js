import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import {
  StackNavigation,
  TabNavigation,
  TabNavigationItem,
} from '@expo/ex-navigation';
import { Ionicons } from '@expo/vector-icons';

import Colors from '../constants/Colors';

export default class RootNavigation extends React.Component {
  render() {
    return (
      <TabNavigation tabBarHeight={56} initialTab="scan">
        <TabNavigationItem
          id="scan" title="Scan" renderTitle={this._renderTitle}
          renderIcon={isSelected => this._renderIcon('ios-qr-scanner', isSelected)}>
          <StackNavigation initialRoute="scan" />
        </TabNavigationItem>

        <TabNavigationItem
          id="history" title="History" renderTitle={this._renderTitle}
          renderIcon={isSelected => this._renderIcon('ios-bookmarks-outline', isSelected)}>
          <StackNavigation initialRoute="history" />
        </TabNavigationItem>
      </TabNavigation>
    );
  }

  _renderIcon(name, isSelected) {
    return (
      <Ionicons
        name={name}
        size={32}
        color={isSelected ? Colors.tabIconSelected : Colors.tabIconDefault}
      />
    );
  }

  _renderTitle = (isSelected, title) => {
    return (
      <Text style={{color: isSelected ? Colors.tabIconSelected : Colors.tabIconDefault}}>
        {title}
      </Text>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  selectedTab: {
    color: Colors.tabIconSelected,
  },
});
