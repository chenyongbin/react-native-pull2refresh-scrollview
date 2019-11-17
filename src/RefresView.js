import React, { Component, PureComponent } from "react";
import { StyleSheet, Animated, Text, Image } from "react-native";
import RefreshState from "./refreshState";

/**
 * 刷新View
 */
export default class RefreshView extends PureComponent {
  render() {
    let stateComponent = null;
    const { height, refreshState } = this.props;

    if (refreshState == RefreshState.refreshing) {
      stateComponent = (
        <Image style={styles.img} source={require("./images/loading.gif")} />
      );
    } else {
      let title = "";
      switch (refreshState) {
        case RefreshState.needPull:
          title = "下拉刷新";
          break;
        case RefreshState.canLoose:
          title = "松手刷新";
          break;
        case RefreshState.refreshFinish:
          title = "刷新完成";
          break;
      }
      stateComponent = <Text style={styles.text}>{title}</Text>;
    }

    return (
      <Animated.View style={[styles.container, { height }]}>
        {stateComponent}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 0,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignContent: "center"
  },
  img: {
    width: 24,
    height: 24,
    alignSelf: "center"
  },
  text: {
    color: "#666",
    fontSize: 13,
    textAlign: "center"
  }
});
