import Expo, {
  ImagePicker,
  LinearGradient,
  FacebookAds
} from 'expo';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Button,
  Clipboard,
  Image,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Easing,
  ImageStore,
  ImageEditor,
  AsyncStorage
} from 'react-native';
import createUUID from '../utilities/createUUID'
import { Spinner } from 'native-base';
import Colors from '../constants/Colors';
import { whiteList, blackList, DESCRIPTOR, AD_IDS } from '../constants/Entities';
import { StyledText } from '../components/StyledText'

const VISION_API_KEY = "AIzaSyCRxQTJIT6psgnQGpeVc4lD2vNh2a7p8Dc"

export default class ScanScreen extends React.Component {
  state = {
    image: null,
    uploading: false,
    stats: null
  }

  componentWillMount() {
    this._mainEntity = ""
    this._infoDrawer = new Animated.Value(0);
    this._fadeIn = new Animated.Value(0);
    this._infoDrawerAnimation = Animated.timing(this._infoDrawer, {
        toValue: 1,
        duration: 1000,
    });
    this._fadeInAnimation = Animated.timing(this._fadeIn, {
        toValue: 1,
        duration: 800,
    });
  }

  componentDidMount() {
    this._fadeInAnimation.start();
    FacebookAds.AdSettings.addTestDevice(FacebookAds.AdSettings.currentDeviceHash);
  }

  _handleBannerAdPress = () => {
    console.log('Banner ad pressed');
  };

  _handleBannerAdError = () => {
    console.log('An error occurred while loading banner ad');
  };

  _renderFacebookBannerAd = () => {
    return (
      <FacebookAds.BannerView
          key="homeAd"
          type="standard"
          placementId={AD_IDS.home}
          onPress={this._handleBannerAdPress}
          onError={this._handleBannerAdError}
          style={{alignSelf: "stretch", marginBottom: 20}}
        />
    )
  }

  render() {
    let { image } = this.state;
    return (
        <LinearGradient start={[0.0, 0.15]} end={[0.3, 1.0]}
          colors={Colors.backgroundGradientColors}
          style={{flex: 1, alignItems: 'center'}}>
          { this._renderFacebookBannerAd() }
          { image ? this._renderImage(image) : this._renderPlaceholder() }
          { this._maybeRenderUploadingOverlay() }
        {
          //  <StatusBar barStyle="default" />
        }
       </LinearGradient>
     );
  }

  _maybeRenderUploadingOverlay = () => {
    if (this.state.uploading) {
      return (
        <View style={[StyleSheet.absoluteFill, {backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center'}]}>
          <ActivityIndicator
            color="#fff"
            animating
            size="large"
          />
        </View>
      );
    }
  }

  _renderImage = (image) => {
    const { stats } = this.state;
    let infoDrawerHeight = this._infoDrawer.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 200],
        extrapolate: 'clamp'
    });
    let index = 1;

    let entitiesInfo = <Spinner color='white'/>;

    if(stats){
      if(stats.mainEntity) {
        const shareMessage = <Text key="shareMessage" style={{color: "#AAA", fontSize: 8, textAlign: "center"}}>tap to share</Text>

        const mainEntity = <StyledText key="mainEntity" style={{marginBottom: 10, fontSize: 24, textAlign: "center", color: "white"}}>
                        {stats.mainEntity}
                      </StyledText>;
        const headerSection = (<View key={"headerSection" + index} style={{flexDirection: "row"}}>
                  <Text key="headerSectionIndex" style={{textAlign: "left", fontSize: 10, color: "#AAA", marginRight: 10}}> # </Text>
                  <Text key="headerSectionDescription" style={{flex: 1, textAlign: "left",  fontSize: 10, color: "#AAA"}}>{DESCRIPTOR}</Text>
                  <Text key="headerSectionScore" style={{flex: 1, textAlign: "right",  fontSize: 10, color: "#AAA"}}>Confidence</Text>
                </View>);

        const succefulEntitiesList = stats.entities.map((entity) => {
            return (<View key={"entityList" + entity.rank} style={{flexDirection: "row"}}>
                      <Text key="index" style={{color: "white", marginRight: 10}}>{entity.rank}:</Text>
                      <Text key="description" style={{color: "white", flex: 1}}>{entity.description}</Text>
                      <Text key="score" style={{color: "#DDD", marginLeft: 10}}>{entity.confidence}%</Text>
                    </View>);
        });
        entitiesInfo = (
          <View style={{width: 230, paddingTop: 5}}>
            {shareMessage}
            {mainEntity}
            {headerSection}
            {succefulEntitiesList}
          </View>
        );
      }else {
        entitiesInfo = (
          <View  style={{flex: 1, padding: 20, justifyContent: "center", alignItems: "center"}}>
            <Text style={{fontSize: 18, textAlign: "center", color: "white"}}>
              {`Unable to identify ${DESCRIPTOR.toLowerCase()}. Try again with a clearer picture.`}
            </Text>
          </View>
        );
      }
    }

    return (
      <View>
        <TouchableOpacity
          onPress={this._share}
          onLongPress={this._share}
          style={{
          marginTop: 10,
          width: 250,
          borderRadius: 3,
          elevation: 4,
          shadowColor: 'rgba(0,0,0,1)',
          shadowOpacity: 0.2,
          shadowOffset: {width: 4, height: 4},
          shadowRadius: 5,
        }}>
          <View key="touchableImage"
            style={{borderTopRightRadius: 3, borderTopLeftRadius: 3, overflow: 'hidden'}}>
            <Image
              source={{uri: image}}
              style={{width: 250, height: 200}}
            />
          </View>
          <Animated.View key="infoDrawer"
            style={{
              height: infoDrawerHeight,
              borderBottomRightRadius: 3,
              borderBottomLeftRadius: 3,
              overflow: 'hidden',
              backgroundColor: "#2F2F2F",
              alignItems: "center"
            }}>
            {entitiesInfo}
          </Animated.View>
        </TouchableOpacity>
        <TouchableOpacity key="clear"
          onPress={this._clearPhoto}
          style={{backgroundColor: "transparent", alignItems: "center"}}>
          <Text style={{color: "white", backgroundColor: "transparent", fontSize: 16}}>
            Clear
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  _renderPlaceholder = () => {
    return (
      <Animated.View style={{
        opacity: this._fadeIn,
        marginTop: 30,
        flexDirection: "row",
        width: 250,
        height: 200,
        borderRadius: 3,
        borderWidth: 5,
        borderStyle: "dashed",
        borderColor: "white",
      }}>
        <TouchableOpacity
          key="takePhoto"
          onPress={this._pickImage}
          style={{height: 200, width: 125, overflow: 'hidden'}}>
          <View style={{padding: 10, flex: 1, justifyContent: "center", alignItems: "center"}}>
            <Ionicons key="uploadIcon" style={{backgroundColor: "transparent"}} name="ios-cloud-upload" size={64} color="white" />
            <Text key="uploadText"
              style={{backgroundColor: "transparent", fontSize: 20, color: "white", textAlign: "center"}}>
                Upload a picture
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          key="uploadPhoto"
          onPress={this._takePhoto}
          style={{height: 200, width: 125, overflow: 'hidden'}}>
          <View style={{padding: 10, flex: 1, justifyContent: "center", alignItems: "center"}}>
            <Ionicons key="cameraIcon" style={{backgroundColor: "transparent"}} name="ios-camera" size={64} color="white" />
            <Text key="cameraText"
              style={{backgroundColor: "transparent", fontSize: 20, color: "white", textAlign: "center"}}>
                Take a picture
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  _parseStats = (entities) => {
    let calculatedStats = {}
    let totalScore = 0;
    let index = 1;
    entities.forEach((entity) => {
      if(whiteList.indexOf(entity.description.replace(/dog/ig,"").trim()) >= 0 &&
          index <= 5 && !blackList.includes(entity.description.trim().toLowerCase())) {
        if(index == 1) {
            calculatedStats = {};
            calculatedStats.entities = [];
            calculatedStats.mainEntity = entity.description;
        }
        calculatedStats.entities.push({
          score: entity.score,
          description: entity.description,
          rank: index++
        });
      }
    });
    if(calculatedStats && calculatedStats.entities) {
      calculatedStats.entities.forEach((stat) => totalScore += stat.score || 0);
      calculatedStats.entities.forEach((stat) => stat.confidence = (((stat.score || 0) / totalScore) * 100).toFixed(2));
    }

    return calculatedStats;
  }

  _clearPhoto = () => {
    this.setState({image: null, stats: null}, () => {
      this._infoDrawer.setValue(0);
    });
  }

  _share = () => {
    const { image, stats } = this.state;
    const mainEntity = stats ? stats.mainEntity : "Dog";

    Share.share({
      message: 'Figured out with `Identify This Dog`',
      title: `Check out this ${mainEntity}`,
      url: image,
    });
  }

  _copyToClipboard = () => {
    Clipboard.setString(this.state.image);
    alert('Copied image URL to clipboard');
  }

  _takePhoto = async () => {
    let pickerResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4,3]
    });

    this._handleImagePicked(pickerResult);
  }

  _pickImage = async () => {
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4,3]
    });

    this._handleImagePicked(pickerResult);
  }

  _handleImagePicked = async (pickerResult) => {
    let uploadResponse, uploadResult;

    try {
      this.setState({uploading: true});
      console.log("Uploading... ")
      if (!pickerResult.cancelled) {
        // uploadResponse = await uploadImageAsync(pickerResult.uri);
        // uploadResult = await uploadResponse.json();
        console.log("picker result: ", pickerResult);
        this.setState({image: pickerResult.uri}, () => {
          this._getImageInfo(pickerResult.uri);
        });
      }else {
        console.log("picker cancelled");
      }
    } catch(e) {
      console.log({uploadResponse});
      console.log({uploadResult});
      console.log({e});
      alert('Upload failed, sorry :(');
    } finally {
      this.setState({uploading: false});
      console.log("Done uploading... ")
    }
  }

  _getImageInfo = async(image) => {
    //https://github.com/facebook/react-native/issues/1158
    this._infoDrawerAnimation.start();
    Image.getSize(image, (width, height) => {
      let imageSettings = {
        offset: { x: 0, y: 0 },
        size: { width: width, height: height }
      };
      ImageEditor.cropImage(image, imageSettings, (uri) => {
        ImageStore.getBase64ForTag(uri, (data) => {
          const body = {
            "requests": [
              {
                "features": [
                  {
                    "type": "WEB_DETECTION"
                  }
                ],
                "image": {
                  "content": data
                }
              }
            ]
          }
          fetch(`https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`, {
            method: 'post',
            body: JSON.stringify(body)
          }).then ( (response) => {
              const respJSON = JSON.parse(response._bodyText)
              const resp = respJSON && respJSON.responses && respJSON.responses[0];
              if(resp && resp.webDetection && resp.webDetection.webEntities) {
                this.setState({stats: this._parseStats(resp.webDetection.webEntities)}, this._saveInHistory)
              }
              console.log("Done analysing... ")

            }
          );
        }, e => console.warn("getBase64ForTag: ", e))
      }, e => console.warn("cropImage: ", e))
    })
  }

  _saveInHistory = async() => {
    const { image, stats } = this.state;
    const historyItem = JSON.stringify({
      "image": image,
      "stats": stats
    });
    console.log("_saveInHistory", createUUID(), historyItem);
    try {
      await AsyncStorage.setItem(`history.${createUUID()}`, historyItem);
    } catch (error) {
      console.warn("Unable to save to history")
    }
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
