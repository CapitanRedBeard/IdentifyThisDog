import React from 'react';
import { Animated, Easing, Text } from 'react-native';

export class StyledText extends React.Component {

  componentWillMount() {
    this._animationValue = new Animated.Value(0);
    this._animation = Animated.timing(this._animationValue, {
        toValue: 1,
        duration: 1000,
    });
  }

  componentDidMount() {
    this._animation.start();
  }

  render() {
    let translate = this._animationValue.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 0],
        extrapolate: 'clamp'
    });

    return (
      <Animated.Text
        {...this.props}
        style={[this.props.style, {fontFamily: 'space-mono', opacity: this._animationValue, marginTop: translate}]}
      />
    );
  }
}
