import { webFeatureAuth } from './web-feature-auth';

describe('webFeatureAuth', () => {
  it('should work', () => {
    expect(webFeatureAuth()).toEqual('web-feature-auth');
  });
});
