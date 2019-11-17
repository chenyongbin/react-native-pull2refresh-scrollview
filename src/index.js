import React, { Component } from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  View,
  PanResponder,
  Animated
} from "react-native";
import RefreshState from "./refreshState";
import RefreshView from "./RefresView";

const DY_DELAY_RATIO = 0.4,
  DY_NEED_PULL = 120 * DY_DELAY_RATIO,
  DY_CAN_LOOSE = 200 * DY_DELAY_RATIO;

export default class PullToRefreshScrollView extends Component {
  constructor(props) {
    super(props);

    this.recoverAnimation = 0;
    this.scrollViewOffsetY = 0;
    this.state = {
      refreshViewState: RefreshState.needPull,
      refreshViewHeight: new Animated.Value(0)
    };

    this.onPull = this.onPull.bind(this);
    this.onPullEnd = this.onPullEnd.bind(this);
    this.onStartPull = this.onStartPull.bind(this);
    this.recoverRefreshView = this.recoverRefreshView.bind(this);
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
    dy *= DY_DELAY_RATIO;
    return dy > 0 && this.scrollViewOffsetY == 0;
  }

  onPull(evt, { dy }) {
    dy *= DY_DELAY_RATIO;
    let refreshViewState = this.state.refreshViewState;
    if (dy <= DY_NEED_PULL) {
      refreshViewState = RefreshState.needPull;
    } else if (dy <= DY_CAN_LOOSE) {
      refreshViewState = RefreshState.canLoose;
    } else {
      return;
    }

    refreshViewState != this.state.refreshViewState &&
      this.setState({ refreshViewState });

    Animated.event([null, { dy: this.state.refreshViewHeight }])(null, { dy });
  }

  onPullEnd(evt, { dy }) {
    dy *= DY_DELAY_RATIO;
    if (dy <= DY_NEED_PULL) {
      this.recoverRefreshView(true);
      return;
    }

    this.setState({ refreshViewState: RefreshState.refreshing });
    setTimeout(() => {
      this.setState(
        { refreshViewState: RefreshState.refreshFinish },
        this.recoverRefreshView
      );
    }, 1500);
  }

  recoverRefreshView(fast = false) {
    if (this.recoverAnimation) {
      this.recoverAnimation.stop();
      this.recoverAnimation = null;
    }

    this.recoverAnimation = Animated.timing(this.state.refreshViewHeight, {
      toValue: 0,
      duration: fast ? 100 : 500
    });
    this.recoverAnimation.start();
  }

  onScrollViewScroll({
    nativeEvent: {
      contentOffset: { y }
    }
  }) {
    this.scrollViewOffsetY = y;
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
        <ScrollView {...newProps}>
          <RefreshView
            height={this.state.refreshViewHeight}
            refreshState={this.state.refreshViewState}
          />
          {this.props.children}
        </ScrollView>
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
