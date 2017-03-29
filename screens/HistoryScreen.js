import React from 'react';
import { ListView, StyleSheet, AsyncStorage, Text, Image, View, TouchableOpacity } from 'react-native';
import { Spinner } from 'native-base';
import Colors from '../constants/Colors';

class Row extends React.Component {
  render() {
    const { image, stats } = this.props;
    let statsComponent = [];
    if(stats) {
      statsComponent.push(<Text key="main" style={styles.mainEntity}>{stats.mainEntity}</Text>)
      stats.entities.forEach((ent) => {
        statsComponent.push(<Text key={`entity${ent.rank}`}
          style={styles.description}>{`${ent.rank}. ${ent.description} ${ent.score}`}</Text>)
      })
    }else {
      statsComponent.push(<Text key="main" style={styles.mainEntity}>Could not identify</Text>)
    }
    return (
      <View style={styles.container}>
        <Image source={{ uri: image}} style={styles.photo} />
        <View style={{flex: 1}}>
          {statsComponent}
        </View>
      </View>
    );
  }
}

export default class HistoryScreen extends React.Component {
  static route = {
    navigationBar: {
      title: 'History',
    },
  };

  state = {
    rowData: null,
    loading: true
  }

  componentWillMount() {
    console.log("componentWillMount")
    this._getPersistentData();
  }

  componentWillReceiveProps(nextProps) {
    console.log("componentWillReceiveProps")
    this._getPersistentData();
  }

  _getPersistentData = () => {
    AsyncStorage.getAllKeys((err, keys) => {
      AsyncStorage.multiGet(keys, (err, stores) => {
        rowData = stores.map((result, i, store) => {
          return JSON.parse(result[1]);
        });
        rowData = rowData.length ? rowData : null;
        this.setState({loading: false, rowData: rowData})
      });
    });
  }

  _clearHistory = async () => {
    this.setState({loading: true, rowData: null}, () => {
      AsyncStorage.clear((err) => {
        if(err) {
          console.warn(err)
        }
        this.setState({loading: false})
      })
    })
  }

  render() {
    const { rowData, loading } = this.state;
    console.log("listItems: ", rowData)
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    if(loading) {
      return <Spinner style={{flex: 1, alignSelf: "center"}} color={Colors.backgroundGradientColors[0]}/>;
    } else if(rowData) {
      let dataSource = ds.cloneWithRows(this.state.rowData);
      return (<View style={{flex: 1}}>
                <TouchableOpacity key="clear"
                  onPress={this._clearHistory}
                  style={styles.clearWrapper}>
                  <Text style={styles.clearText}>
                    Clear
                  </Text>
                </TouchableOpacity>
                <ListView
                    enableEmptySections={true}
                    dataSource={dataSource}
                    renderRow={(data) => <Row {...data} />}
                    renderSeparator={(sID, rID) => <View key={rID} style={styles.separator} />}/>
                </View>);

    } else {
      return <Text style={styles.placeholder}>No available history</Text>
    }
    // return !loading ? (listItems ? <FlatList
    //           data={[{key: 'a'}, {key: 'b'}]}
    //           renderItem={({item}) => <Text>{item.key}</Text>}/> :
    //        <Spinner color={Colors.backgroundGradientColors[0]}/>) :
    //        <Text>No available history</Text>;

  }
}

const styles = StyleSheet.create({
  separator: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8E8E8E',
  },
  container: {
    flex: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainEntity: {
    marginLeft: 12,
    fontSize: 20,
  },
  photo: {
    height: 80,
    width: 80,
  },
  clearWrapper: {
    backgroundColor: "transparent",
    alignItems: "center"
  },
  clearText: {
    color: Colors.linkColor,
    backgroundColor: "transparent",
    fontSize: 16,
    padding: 5
  },
  placeholder: {
    backgroundColor: "transparent",
    alignItems: "center",
    fontSize: 16
  },
  description: {
    color: "#AAA",
    marginLeft: 16,
    fontSize: 12,
  }
});
