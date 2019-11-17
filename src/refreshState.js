const needPull = "NEED_PULL",
  canLoose = "CAN_LOOSE",
  refreshing = "REFRESHING",
  refreshFinish = "REFRESH_FINISH";

/**
 * 刷新状态
 */
const RefreshState = {
  /**
   * 需要继续下拉
   */
  needPull,
  /**
   * 可以松手
   */
  canLoose,
  /**
   * 正在刷新
   */
  refreshing,
  /**
   * 刷新完成
   */
  refreshFinish
};

export default RefreshState;
