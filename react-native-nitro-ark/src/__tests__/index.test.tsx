jest.mock('react-native-nitro-modules', () => {
  const updateHistoryMetadata = jest.fn(() => Promise.resolve());

  return {
    NitroModules: {
      createHybridObject: () => ({ updateHistoryMetadata }),
    },
    mockUpdateHistoryMetadata: updateHistoryMetadata,
  };
});

const { mockUpdateHistoryMetadata } = jest.requireMock(
  'react-native-nitro-modules'
) as {
  mockUpdateHistoryMetadata: jest.MockedFunction<
    (movementId: number, patchJson: string) => Promise<void>
  >;
};

import { updateHistoryMetadata } from '../index';

describe('updateHistoryMetadata', () => {
  beforeEach(() => {
    mockUpdateHistoryMetadata.mockClear();
  });

  it('delegates valid movement IDs and patches to the native bridge', async () => {
    await updateHistoryMetadata(42, '{"noah":{"lnurl_pay":{"comment":"Hi"}}}');

    expect(mockUpdateHistoryMetadata).toHaveBeenCalledWith(
      42,
      '{"noah":{"lnurl_pay":{"comment":"Hi"}}}'
    );
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, -1, 1.5, 0x100000000])(
    'rejects invalid movement ID %p',
    (movementId) => {
      expect(() => updateHistoryMetadata(movementId, '{}')).toThrow(
        'movementId must be a finite unsigned 32-bit integer'
      );
      expect(mockUpdateHistoryMetadata).not.toHaveBeenCalled();
    }
  );
});
