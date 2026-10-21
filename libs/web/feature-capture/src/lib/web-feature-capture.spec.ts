import { webFeatureCapture } from './web-feature-capture';

describe('webFeatureCapture', () => {
  it('should work', () => {
    expect(webFeatureCapture()).toEqual('web-feature-capture');
  });
});
