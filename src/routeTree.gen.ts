/* eslint-disable */
// @ts-nocheck
import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as CreateRouteImport } from './routes/create'
import { Route as AuthRouteImport } from './routes/auth'
import { Route as VIdRouteImport } from './routes/v.$id'

const IndexRoute = IndexRouteImport.update({ path: '/', getParentRoute: () => rootRouteImport })
const CreateRoute = CreateRouteImport.update({ path: '/create', getParentRoute: () => rootRouteImport })
const AuthRoute = AuthRouteImport.update({ path: '/auth', getParentRoute: () => rootRouteImport })
const VIdRoute = VIdRouteImport.update({ path: '/v/$id', getParentRoute: () => rootRouteImport })

export const routeTree = rootRouteImport.addChildren([IndexRoute, CreateRoute, AuthRoute, VIdRoute])
