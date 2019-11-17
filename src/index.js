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

    this.recoverAnimation = null;
    this.scrollViewReachTop = true;
    this.state = {
      refreshViewState: RefreshState.needPull,
      refreshViewHeight: new Animated.Value(0)
    };

    this.onPull = this.onPull.bind(this);
    this.onPullEnd = this.onPullEnd.bind(this);
    this.onStartPull = this.onStartPull.bind(this);
    this.onScrollViewScroll = this.onScrollViewScroll.bind(this);
    this.disposeRecoverAimation = this.disposeRecoverAimation.bind(this);
    this.recoverRefreshView = this.recoverRefreshView.bind(this);

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
    return (
      dy > 0 &&
      this.scrollViewReachTop &&
      this.state.refreshViewState != RefreshState.refreshing &&
      this.recoverAnimation == null
    );
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
    if (this.props.onRefresh) {
      this.props.onRefresh(() => {
        this.setState(
          { refreshViewState: RefreshState.refreshFinish },
          this.recoverRefreshView
        );
      });
    }
  }

  disposeRecoverAimation() {
    if (this.recoverAnimation) {
      this.recoverAnimation.stop();
      this.recoverAnimation = null;
    }
  }

  recoverRefreshView(fast = false) {
    this.disposeRecoverAimation();

    this.recoverAnimation = Animated.timing(this.state.refreshViewHeight, {
      toValue: 0,
      duration: fast ? 100 : 500
    });
    this.recoverAnimation.start(this.disposeRecoverAimation);
  }

  onScrollViewScroll({
    nativeEvent: {
      contentOffset: { y }
    }
  }) {
    this.scrollViewReachTop = y == 0;
  }

  render() {
    const { enableRefresh, renderRefresh, children } = this.props;
    if (!enableRefresh) {
      return <ScrollView {...this.props}>{children}</ScrollView>;
    }

    const newProps = Object.assign({}, this.props, {
        bounces: false,
        scrollEventThrottle: 50,
        onScroll: this.onScrollViewScroll
      }),
      refreshViewState = {
        height: this.state.refreshViewHeight,
        refreshState: this.state.refreshViewState
      };

    let refreshView = renderRefresh ? renderRefresh(refreshViewState) : null;
    if (refreshView == null) {
      refreshView = <RefreshView {...refreshViewState} />;
    }

    return (
      <View style={styles.container} {...this.responderInstance.panHandlers}>
        <ScrollView {...newProps}>
          {refreshView}
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
