import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { SupabaseAuthGuard } from './supabase-auth.guard';

function mockHttpContext(request: Record<string, unknown>) {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as never;
}

describe('RolesGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  };
  const guard = new RolesGuard(reflector as unknown as Reflector);

  beforeEach(() => jest.clearAllMocks());

  it('allows public routes', () => {
    reflector.getAllAndOverride.mockReturnValueOnce(true);
    expect(guard.canActivate(mockHttpContext({}))).toBe(true);
  });

  it('allows when no roles required', () => {
    reflector.getAllAndOverride.mockReturnValueOnce(false).mockReturnValueOnce(undefined);
    expect(guard.canActivate(mockHttpContext({ user: { role: 'CUSTOMER' } }))).toBe(true);
  });

  it('rejects missing user when roles required', () => {
    reflector.getAllAndOverride.mockReturnValueOnce(false).mockReturnValueOnce(['ADMINISTRATOR']);
    expect(() => guard.canActivate(mockHttpContext({}))).toThrow(ForbiddenException);
  });

  it('rejects insufficient role', () => {
    reflector.getAllAndOverride.mockReturnValueOnce(false).mockReturnValueOnce(['ADMINISTRATOR']);
    expect(() =>
      guard.canActivate(mockHttpContext({ user: { role: 'CUSTOMER' } })),
    ).toThrow(ForbiddenException);
  });

  it('allows matching role', () => {
    reflector.getAllAndOverride.mockReturnValueOnce(false).mockReturnValueOnce(['ADMINISTRATOR']);
    expect(
      guard.canActivate(mockHttpContext({ user: { role: 'ADMINISTRATOR' } })),
    ).toBe(true);
  });
});

describe('SupabaseAuthGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  };
  const authService = {
    validateToken: jest.fn(),
    resolveAuthUser: jest.fn(),
  };
  const guard = new SupabaseAuthGuard(
    reflector as unknown as Reflector,
    authService as never,
  );

  beforeEach(() => jest.clearAllMocks());

  it('allows public route without token', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const request = { headers: {} };
    await expect(guard.canActivate(mockHttpContext(request))).resolves.toBe(true);
  });

  it('soft-attaches user on public route with valid token', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    authService.validateToken.mockResolvedValue({ id: 'auth-1', email: 'a@b.com' });
    authService.resolveAuthUser.mockResolvedValue({
      id: 'p1',
      email: 'a@b.com',
      role: 'CUSTOMER',
      profileId: 'p1',
    });
    const request: Record<string, unknown> = {
      headers: { authorization: 'Bearer good-token' },
    };

    await expect(guard.canActivate(mockHttpContext(request))).resolves.toBe(true);
    expect(request.user).toMatchObject({ id: 'p1' });
  });

  it('ignores invalid token on public route', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    authService.validateToken.mockRejectedValue(new UnauthorizedException());
    const request = { headers: { authorization: 'Bearer bad' } };

    await expect(guard.canActivate(mockHttpContext(request))).resolves.toBe(true);
  });

  it('requires token on private routes', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    await expect(guard.canActivate(mockHttpContext({ headers: {} }))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('attaches auth user on private routes', async () => {
    reflector.getAllAndOverride
      .mockReturnValueOnce(false) // isPublic
      .mockReturnValueOnce(true); // requireProfile
    authService.validateToken.mockResolvedValue({ id: 'auth-1', email: 'a@b.com' });
    authService.resolveAuthUser.mockResolvedValue({
      id: 'p1',
      email: 'a@b.com',
      role: 'CUSTOMER',
      profileId: 'p1',
    });
    const request: Record<string, unknown> = {
      headers: { authorization: 'Bearer tok' },
    };

    await expect(guard.canActivate(mockHttpContext(request))).resolves.toBe(true);
    expect(request.user).toMatchObject({ profileId: 'p1' });
  });

  it('rejects when profile not synced', async () => {
    reflector.getAllAndOverride.mockReturnValueOnce(false).mockReturnValueOnce(true);
    authService.validateToken.mockResolvedValue({ id: 'auth-1', email: 'a@b.com' });
    authService.resolveAuthUser.mockResolvedValue(null);
    const request = { headers: { authorization: 'Bearer tok' } };

    await expect(guard.canActivate(mockHttpContext(request))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('skips profile resolve when requireProfile is false', async () => {
    reflector.getAllAndOverride
      .mockReturnValueOnce(false) // isPublic
      .mockReturnValueOnce(false); // requireProfile
    authService.validateToken.mockResolvedValue({ id: 'auth-1', email: 'a@b.com' });
    const request: Record<string, unknown> = {
      headers: { authorization: 'Bearer tok' },
    };

    await expect(guard.canActivate(mockHttpContext(request))).resolves.toBe(true);
    expect(authService.resolveAuthUser).not.toHaveBeenCalled();
    expect(request.supabaseUser).toMatchObject({ id: 'auth-1' });
  });
});
