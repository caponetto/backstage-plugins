import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { mockMembers } from '../__fixtures__/mockMembers';
import { useMembers } from './useMembers';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn().mockReturnValue({
    getRole: jest.fn().mockReturnValue([
      {
        memberReferences: [
          'group:default/admins',
          'user:default/amelia.park',
          'user:default/calum.leavy',
          'group:default/team-b',
          'group:default/team-c',
        ],
        name: 'role:default/rbac_admin',
      },
    ]),
    getMembers: jest.fn().mockReturnValue(mockMembers),
  }),
}));

describe('useMembers', () => {
  it('should return members', async () => {
    const { result } = renderHook(() => useMembers('role:default/rbac_admin'));
    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
      expect(result.current.data).toHaveLength(5);
    });
  });
});
