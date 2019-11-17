/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Fragment, useState, useCallback } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  SafeAreaView
} from "react-native";
import PullToRefreshScrollView from "./src";

import getArticle from "./getArticle";

const App: () => React$Node = () => {
  const [article, setArticle] = useState(getArticle());

  const onRefresh = onRefreshFinish => {
    setTimeout(() => {
      setArticle(getArticle());
      onRefreshFinish && onRefreshFinish();
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <PullToRefreshScrollView enableRefresh={true} onRefresh={onRefresh}>
        {article != null ? (
          <Fragment>
            <Text style={styles.title}>{article.title}</Text>
            {article.paragraphs.map((item, index) => (
              <Paragrah key={index} content={item} />
            ))}
          </Fragment>
        ) : null}
      </PullToRefreshScrollView>
    </SafeAreaView>
  );
};

class Paragrah extends React.PureComponent {
  render() {
    return (
      <Text style={styles.paragraph}>
        {"      "}
        {this.props.content}
      </Text>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "gray"
    // backgroundColor: "rgba(237,237,237,1)"
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 30
  },
  paragraph: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 18,
    paddingHorizontal: 15,
    marginBottom: 20
  }
});

export default App;
