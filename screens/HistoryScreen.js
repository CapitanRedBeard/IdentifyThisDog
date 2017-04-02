import React from 'react';
import {
  ListView,
  StyleSheet,
  AsyncStorage,
  Text,
  Image,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AppLink from 'react-native-app-link';
import { Spinner } from 'native-base';
import { LinearGradient, FacebookAds } from 'expo';
import Colors from '../constants/Colors';
import { APP_ID_IOS, APP_ID_ANDROID } from '../constants/Entities'

class Row extends React.Component {
  render() {
    const { image, stats } = this.props;
    let statsComponent = [];
    if(stats) {
      statsComponent.push(<Text key="main" style={styles.mainEntity}>{stats.mainEntity}</Text>)
      stats.entities.forEach((ent) => {
        statsComponent.push(<Text key={`entity${ent.rank}`}
          style={styles.description}>{`${ent.confidence}% ${ent.description}`}</Text>)
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
  state = {
    rowData: null,
    loading: true
  }

  componentDidMount() {
    FacebookAds.AdSettings.addTestDevice(FacebookAds.AdSettings.currentDeviceHash);
  }

  _handleBannerAdPress = () => {
    console.warn('Banner ad pressed');
  };

  _handleBannerAdError = () => {
    console.warn('An error occurred while loading banner ad');
  };

  _renderFacebookBannerAd = () => {
    return (
      <FacebookAds.BannerView
          key="historyAd"
          type="standard"
          placementId="235148286954512_235588606910480"
          onPress={this._handleBannerAdPress}
          onError={this._handleBannerAdError}
          style={{alignSelf: "stretch", marginBottom: 20}}
        />
    )
  }

  componentWillMount() {
    console.log("componentWillMount")
    this._getPersistentData();
  }

  componentWillReceiveProps(nextProps) {
    console.log("componentWillReceiveProps")
    this._getPersistentData();
    this._promptReview();
  }

  _promptReview = () => {
    console.log("_promptReview")
    AsyncStorage.getItem("rateRequested", (err, result) => {
      if(!result) {
        Alert.alert('Would you like to help out this app by rating it?',
          null,
          [
            {text: 'Sure!', onPress: () => {
              AppLink.openInStore(APP_ID_IOS, APP_ID_ANDROID);
            }},
            {text: 'Nope'}
          ]
        );
        AsyncStorage.setItem("rateRequested", "set", (e, r) => {});
      }
    });
  }

  _getPersistentData = () => {
    AsyncStorage.getAllKeys((err, keys) => {
      AsyncStorage.multiGet(keys, (err, stores) => {
        let rowData = [];
        stores.forEach((result, i, store) => {
          console.log("Result: ", result[0])
          if(result[0].includes("history")) {
            rowData.push(JSON.parse(result[1]));
          }
        });
        rowData = rowData.length ? rowData : null;
        this.setState({loading: false, rowData: rowData})
      });
    });
  }

  _clearHistory = async () => {
    this.setState({loading: true, rowData: null}, () => {
      AsyncStorage.getAllKeys((err, keys) => {
        keys.forEach((key, val) => {
          console.log("Key, val: ", key, val);
          if(key.includes("history")) {
            AsyncStorage.removeItem(key, (err) => {
              if(err) {
                console.warn(err)
              }
            })
          }
        })
        this.setState({loading: false})
      });
      // AsyncStorage.clear((err) => {
      //   if(err) {
      //     console.warn(err)
      //   }
      //   this.setState({loading: false})
      // })
    })
  }

  _renderList = () => {
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
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
                <ListView
                    enableEmptySections={true}
                    dataSource={dataSource}
                    renderRow={(data) => <Row {...data} />}/>
                </View>);

    } else {
      return <Text style={styles.placeholder}>No available history</Text>
    }
  }

  render() {
    return (
      <LinearGradient start={[0.0, 0.15]} end={[0.3, 1.0]}
        colors={Colors.backgroundGradientColors} style={{flex: 1}}>
        { this._renderFacebookBannerAd() }
        { this._renderList() }
     </LinearGradient>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 3,
    elevation: 4,
    shadowColor: 'rgba(0,0,0,1)',
    shadowOpacity: 0.2,
    shadowOffset: {width: 4, height: 4},
    shadowRadius: 5,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    marginBottom: 0
  },
  mainEntity: {
    backgroundColor: "transparent",
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
    color: "white",
    backgroundColor: "transparent",
    fontSize: 20,
    padding: 5
  },
  placeholder: {
    backgroundColor: "transparent",
    textAlign: "center",
    fontSize: 20,
    color: "white",
    padding: 20
  },
  description: {
    backgroundColor: "transparent",
    color: "#AAA",
    marginLeft: 16,
    fontSize: 12,
  }
});
