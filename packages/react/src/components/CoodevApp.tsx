import * as React from 'react'
import App from '__COODEV__/react/app'
import routes from '__COODEV__/react/routes'
import { RouterContext } from '../contexts/router'
import { router } from '../router/router'
import { findMatchedRoute, matchParams } from '../utils'

interface CoodevAppProps {
  url: string
  path: string | null
  Component: React.ComponentType<any> | null
  pageProps: object
}

interface Config extends Omit<CoodevAppProps, 'url'> {
  params: object
}

function CoodevApp(props: CoodevAppProps) {
  const configRef = React.useRef<Config>({
    path: props.path,
    Component: props.Component,
    pageProps: props.pageProps,
    params: matchParams(props.path || '/', props.url),
  })

  const [location, setLocation] = React.useState<any>(() => {
    const parsedUrl = new URL(props.url, 'http://localhost')
    return {
      key: '',
      pathname: parsedUrl.pathname || '/',
      search: parsedUrl.search || '',
      hash: parsedUrl.hash || '',
      state: null,
    }
  })

  React.useEffect(() => {
    const unlisten = router.listen(async ({ location, action }) => {
      const matched = findMatchedRoute(location.pathname, routes)
      if (matched) {
        configRef.current.Component = matched.component
        configRef.current.path = matched.path
        configRef.current.params = matchParams(matched.path, location.pathname)
      } else {
        configRef.current.params = {}
        configRef.current.Component = null
      }

      let pageProps = {}
      if (App.getInitialProps) {
        pageProps = await App.getInitialProps({
          Component: configRef.current.Component,
          params: configRef.current.params,
        })
      }

      configRef.current.pageProps = pageProps

      setLocation(location)
    })
    return unlisten
  }, [location.pathname])

  const store = React.useMemo(
    () => ({ location, params: configRef.current.params }),
    [location],
  )

  return (
    <RouterContext.Provider value={store}>
      <App
        Component={configRef.current.Component}
        pageProps={configRef.current.pageProps}
        params={configRef.current.params}
      />
    </RouterContext.Provider>
  )
}

export default CoodevApp
