// src/assets/profileImages.ts
// Handbook Sec 11.3 — Asset Registry Contract.
// No screen or component may call require() directly. Every image flows
// through this single file. If an asset path changes, this is the only
// file that needs updating.
//
// Deliver every raster asset in three densities (Sec 11.2):
//   image.png (1x) / image@2x.png / image@3x.png
// React Native selects the correct variant automatically.

const images = {
  // Auth feature assets
  loginbg: require('./images/Auth/login_bg.png'),
  onboardingLogo: require('./images/Auth/onboarding_logo.png'),

  // Home feature assets
  homeBanner: require('./images/Home/banner_placeholder.png'),

  // Shared cross-feature assets
  backArrow: require('./images/back_arrow.png'),
  filterIcon: require('./images/filter.png'),
  downArrow: require('./images/down_arrow.png'),

  // Dev/dummy placeholders — used before production assets arrive
  dummyProduct: require('./images/dummy/product_placeholder.png'),
};

export default images;
