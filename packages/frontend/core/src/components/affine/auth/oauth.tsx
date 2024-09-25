import { Skeleton } from '@affine/component';
import { Button } from '@affine/component/ui/button';
import { AuthService, ServerConfigService } from '@affine/core/modules/cloud';
import { popupWindow } from '@affine/core/utils';
import { appInfo } from '@affine/electron-api';
import { OAuthProviderType } from '@affine/graphql';
import { GithubIcon, GoogleDuotoneIcon } from '@blocksuite/icons/rc';
import { useLiveData, useService } from '@toeverything/infra';
import { type ReactElement, useCallback } from 'react';

const OAuthProviderMap: Record<
  OAuthProviderType,
  {
    icon: ReactElement;
  }
> = {
  [OAuthProviderType.Google]: {
    icon: <GoogleDuotoneIcon />,
  },

  [OAuthProviderType.GitHub]: {
    icon: <GithubIcon />,
  },

  [OAuthProviderType.OIDC]: {
    // TODO(@catsjuice): Add OIDC icon
    icon: <GoogleDuotoneIcon />,
  },
};

export function OAuth({ redirectUrl }: { redirectUrl?: string }) {
  const serverConfig = useService(ServerConfigService).serverConfig;
  const oauth = useLiveData(serverConfig.features$.map(r => r?.oauth));
  const oauthProviders = useLiveData(
    serverConfig.config$.map(r => r?.oauthProviders)
  );

  if (!oauth) {
    return <Skeleton height={50} />;
  }

  return oauthProviders?.map(provider => (
    <OAuthProvider
      key={provider}
      provider={provider}
      redirectUrl={redirectUrl}
    />
  ));
}

type OAuthProviderProps = {
  provider: OAuthProviderType;
  redirectUrl?: string;
};

function OAuthProvider({ provider, redirectUrl }: OAuthProviderProps) {
  const auth = useService(AuthService);
  const { icon } = OAuthProviderMap[provider];

  const onClick = useCallback(() => {
    async function preflight() {
      if (ignore) return;
      const url = await auth.oauthPreflight(
        provider,
        appInfo?.schema,
        false,
        redirectUrl
      );
      if (!ignore) {
        popupWindow(url);
      }
    }

    let ignore = false;
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    preflight();
    return () => {
      ignore = true;
    };
  }, [auth, provider]);

  return (
    <Button
      key={provider}
      variant="primary"
      block
      size="extraLarge"
      style={{ marginTop: 30, width: '100%' }}
      prefix={icon}
      onClick={onClick}
    >
      Continue with {provider}
    </Button>
  );
}
