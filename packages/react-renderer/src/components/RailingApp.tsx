import * as React from 'react'
import { match } from 'path-to-regexp'
import { parse as parseUrl } from 'url'
import App from '__RAILING__/react/app'
import routes from '__RAILING__/react/routes'
import { RouterContext } from '../contexts/router'
import { history } from '../router/router'
import { findMatchedRoute } from '../utils'

interface RailingAppProps {
  url: string
  path: string
  Component: React.ComponentType<any> | null
  pageProps: object
}

interface Config extends Omit<RailingAppProps, 'url'> {
  params: object
}

function matchParams(path: string, pathname: string) {
  const matched = match(path)(pathname)
  return matched ? matched.params : {}
}

function RailingApp(props: RailingAppProps) {
  const configRef = React.useRef<Config>({
    path: props.path,
    Component: props.Component,
    pageProps: props.pageProps,
    params: {},
  })
  const [location, setLocation] = React.useState<any>(() => {
    const parsedUrl = parseUrl(props.url)
    return {
      key: '',
      pathname: parsedUrl.pathname || '/',
      search: parsedUrl.search || '',
      hash: parsedUrl.hash || '',
      state: null,
    }
  })

  React.useEffect(
    () => {
      const unlisten = history.listen(async ({ location, action }) => {
        console.log(location);

        const matched = findMatchedRoute(
          location.pathname,
          routes
        )
        if (matched) {
          configRef.current.Component = matched.component as any
          configRef.current.path = matched.path
          configRef.current.params = matchParams(matched.path, location.pathname)
        } else {
          configRef.current.params = {}
          configRef.current.Component = null
        }

        let pageProps = {}
        // @ts-ignore
        if (App.getInitialProps) {
          pageProps = await App.getInitialProps({
            Component: configRef.current.Component
          })
        }

        configRef.current.pageProps = pageProps

        setLocation(location)
      })
      return unlisten
    },
    [location.pathname]
  )

  const store = React.useMemo(
    () => ({ location, params: configRef.current.params }),
    [location]
  )

  return (
    <RouterContext.Provider value={store}>
      <App
        Component={configRef.current.Component}
        pageProps={configRef.current.pageProps}
      />
    </RouterContext.Provider>
  )
}

export default RailingApp