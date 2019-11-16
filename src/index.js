import React, { Component } from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  View,
  PanResponder,
  Animated
} from "react-native";

const DY_NEED_PULL = 180,
  DY_CAN_LOOSE = 320;

export default class PullToRefreshScrollView extends Component {
  constructor(props) {
    super(props);

    this.recoverAnimation = 0;
    this.scrollViewOffsetY = 0;
    this.state = {
      refreshingTitle: "下拉刷新",
      refreshingHeight: new Animated.Value(0)
    };

    this.onPull = this.onPull.bind(this);
    this.recover = this.recover.bind(this);
    this.onPullEnd = this.onPullEnd.bind(this);
    this.onStartPull = this.onStartPull.bind(this);
    this.onScrollViewScroll = this.onScrollViewScroll.bind(this);

    this.responderInstance = PanResponder.create({
      onStartShouldSetPanResponder: this.onStartPull,
      onMoveShouldSetPanResponder: this.onStartPull,
      onPanResponderMove: this.onPull,
      onPanResponderTerminate: this.onPullEnd,
      onPanResponderRelease: this.onPullEnd
    });
  }

  onStartPull(evt, { dy }) {
    const enabled = dy > 0 && this.scrollViewOffsetY == 0;
    // console.log(
    //   `onStartPull dy=${dy}, scrollViewOffsetY=${this.scrollViewOffsetY}, enableResponder=${enabled}`
    // );
    return enabled;
  }

  onPull(evt, { dy }) {
    console.log(`onPull`, dy);
    let refreshTitle = this.state.refreshingTitle;
    if (dy <= DY_NEED_PULL) {
      refreshTitle = "下拉刷新";
    } else if (dy < DY_CAN_LOOSE) {
      refreshTitle = "松手刷新";
    }

    refreshTitle != this.state.refreshingTitle &&
      this.setState({ refreshingTitle: refreshTitle });

    Animated.event([null, { dy: this.state.refreshingHeight }])(null, { dy });
  }

  onPullEnd(evt, { dy }) {
    console.log("onPullEnd", dy);
    if (dy <= DY_NEED_PULL) {
      this.recover();
      return;
    }

    this.setState({ refreshingTitle: "正在刷新..." });
    setTimeout(this.recover, 3000);
  }

  recover() {
    if (this.recoverAnimation) {
      this.recoverAnimation.stop();
      this.recoverAnimation = null;
    }

    this.recoverAnimation = Animated.timing(this.state.refreshingHeight, {
      toValue: 0,
      duration: 100
    });
    this.recoverAnimation.start(() =>
      this.setState({ refreshingTitle: "刷新成功" })
    );
  }

  onScrollViewScroll({
    nativeEvent: {
      contentOffset: { y }
    }
  }) {
    this.scrollViewOffsetY = y;
    console.log(`scrollViewOffsetY=${this.scrollViewOffsetY}`);
  }

  render() {
    const { enableRefresh, children } = this.props;

    if (!enableRefresh) {
      return <ScrollView {...this.props}>{children}</ScrollView>;
    }

    const newProps = Object.assign({}, this.props, {
      bounces: false,
      scrollEventThrottle: 100,
      onScroll: this.onScrollViewScroll
    });

    return (
      <View style={styles.container} {...this.responderInstance.panHandlers}>
        <Animated.View
          style={[styles.refreshing, { height: this.state.refreshingHeight }]}
        >
          <Text style={styles.refreshing_text}>
            {this.state.refreshingTitle}
          </Text>
        </Animated.View>
        <ScrollView {...newProps}>{this.props.children}</ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  refreshing: {
    width: "100%",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignContent: "center"
  },
  refreshing_text: {
    color: "#666",
    fontSize: 13,
    textAlign: "center"
  }
});
