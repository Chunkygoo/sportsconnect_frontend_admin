import { fetchUtils, DataProvider, Identifier } from 'ra-core';
import myAxiosPrivate from '../../../network/myAxiosPrivate';

/**
 * Maps react-admin queries to a postgrest REST API
 *
 * This REST dialect uses postgrest syntax
 *
 * @see https://postgrest.org/en/stable/api.html#embedded-filters
 *
 * @example
 *
 * getList          => GET    http://my.api.url/posts?order=title.asc&offset=0&limit=24&filterField=eq.value
 * getOne           => GET    http://my.api.url/posts?id=eq.123
 * getMany          => GET    http://my.api.url/posts?id=in.(123,456,789)
 * getManyReference => GET    http://my.api.url/posts?author_id=eq.345
 * create           => POST   http://my.api.url/posts
 * update           => PATCH  http://my.api.url/posts?id=eq.123
 * updateMany       => PATCH  http://my.api.url/posts?id=in.(123,456,789)
 * delete           => DELETE http://my.api.url/posts?id=eq.123
 * deleteMany       => DELETE http://my.api.url/posts?id=in.(123,456,789)
 *
 * @example
 *
 * import * as React from 'react';
 * import { Admin, Resource } from 'react-admin';
 * import postgrestRestProvider from '@promitheus/ra-data-postgrest';
 *
 * import { PostList } from './posts';
 *
 * const App = () => (
 *     <Admin dataProvider={postgrestRestProvider('http://path.to.my.api/')}>
 *         <Resource name="posts" list={PostList} />
 *     </Admin>
 * );
 *
 * export default App;
 */
function parseFilters(filter, defaultListOp) {
  let result = {};
  Object.keys(filter).forEach(function (key) {
    // key: the name of the object key

    const splitKey = key.split('@');
    const operation = splitKey.length === 2 ? splitKey[1] : defaultListOp;

    let values;
    if (operation.includes('like')) {
      // we split the search term in words
      values = filter[key].trim().split(' ');
    } else {
      values = [filter[key]];
    }

    values.forEach(value => {
      // if operator is intentionally blank, rpc syntax 
      let op = operation.includes('like') ? `${operation}.*${value}*` : operation.length === 0 ? `${value}` : `${operation}.${value}`;

      if (result[splitKey[0]] === undefined) {
        // first operator for the key, we add it to the dict
        result[splitKey[0]] = op;
      }
      else
      {
        if (!Array.isArray(result[splitKey[0]])) {
          // second operator, we transform to an array
          result[splitKey[0]] = [result[splitKey[0]], op]
        } else {
          // third and subsequent, we add to array
          result[splitKey[0]].push(op);
        }
      }
    });

  });

  return result;
}

// compound keys capability
type PrimaryKey = Array<string>;

const getPrimaryKey = (resource : string, primaryKeys: Map<string, PrimaryKey>) => {
  return primaryKeys.get(resource) || ['id'];
}

const decodeId = (id: Identifier, primaryKey: PrimaryKey): string[] => {
  if (isCompoundKey(primaryKey)) {
    return JSON.parse(id.toString());
  } else {
    return [id.toString()];
  }
}

const encodeId = (data: any, primaryKey: PrimaryKey): Identifier => {
  if (isCompoundKey(primaryKey)) {
    return JSON.stringify(primaryKey.map(key => data[key]));
  } else {
    return data[primaryKey[0]];
  }
}

const dataWithId = (data: any, primaryKey: PrimaryKey) => {
  // if (primaryKey === ['id']) {
  //   return data;
  // }

  if (primaryKey.length === 1 && primaryKey[0] === 'id') {
    return data;
  }

  return Object.assign(data, {
    id: encodeId(data, primaryKey)
  });
}

const isCompoundKey = (primaryKey: PrimaryKey) : Boolean => {
  return primaryKey.length > 1;
}

const getQuery = (primaryKey : PrimaryKey, ids: Identifier | Array<Identifier>, resource: string) : string => {
  if (Array.isArray(ids) && ids.length > 1) {
    // no standardized query with multiple ids possible for rpc endpoints which are api-exposed database functions
    if (resource.startsWith('rpc/')) {
      console.error('PostgREST\'s rpc endpoints are not intended to be handled as views. Therefore, no query generation for multiple key values implemented!');

      return "";
    }

    if (isCompoundKey(primaryKey)) {
      return `or=(
          ${ids.map(id => {
                const primaryKeyParams = decodeId(id, primaryKey);
                return `and(${primaryKey.map((key, i) => `${key}.eq.${primaryKeyParams[i]}`).join(',')})`;
              })
            }
        )`;
      } else {
        return new URLSearchParams({ [primaryKey[0]]: `in.(${ids.join(',')})` }).toString();
      }
  } else {
    // if ids is one Identifier
    const id : Identifier = ids.toString();
    const primaryKeyParams = decodeId(id, primaryKey);

    if (isCompoundKey(primaryKey)) {
      if (resource.startsWith('rpc/'))
        return `${primaryKey.map((key : string, i: any) => `${key}=${primaryKeyParams[i]}`).join('&')}`;
      else
        return `and=(${primaryKey.map((key : string, i: any) => `${key}.eq.${primaryKeyParams[i]}`).join(',')})`;
    } else {
      return new URLSearchParams([[primaryKey[0], `eq.${id}`]]).toString();
    }
  }
}

const getKeyData = (primaryKey : PrimaryKey, data: object) : object => {
  if (isCompoundKey(primaryKey)) {
    return primaryKey.reduce(
      (keyData, key) => ({
        ...keyData,
          [key]: data[key]
        }), 
      {});
  } else {
    return { [primaryKey[0]]: data[primaryKey[0]] };
  }
}

const getOrderBy = (field : string, order: string, primaryKey : PrimaryKey) => {
  if (field === 'id') {
    return primaryKey.map(key => (`${key}.${order.toLowerCase()}`)).join(',');
  } else {
    return `${field}.${order.toLowerCase()}`;
  }
};

const defaultPrimaryKeys = new Map<string, PrimaryKey>();

const dataProvider = (apiUrl, httpClient = fetchUtils.fetchJson, defaultListOp = 'eq', 
                primaryKeys: Map<string, PrimaryKey> = defaultPrimaryKeys): DataProvider => ({
  getList: async (resource, params) => {
    const primaryKey = getPrimaryKey(resource, primaryKeys);

    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const parsedFilter = parseFilters(params.filter, defaultListOp);

    const query = {
      order: getOrderBy(field, order, primaryKey),
      offset: String((page - 1) * perPage),
      limit: String(perPage),
      // append filters
      ...parsedFilter
    };

    const url = `${apiUrl}/${resource}?${new URLSearchParams(query)}`;
    let myAxios = await myAxiosPrivate();
    return myAxios.get(url).then(({ headers, data }) => {
      if (!('content-range' in headers)) {
        throw new Error(
          `The Content-Range header is missing in the HTTP Response. The postgREST data provider expects 
          responses for lists of resources to contain this header with the total number of results to build 
          the pagination. If you are using CORS, did you declare Content-Range in the Access-Control-Expose-Headers header?`
        );
      }

      // console.log(data.map(obj => dataWithId(obj, primaryKey)));
      
      return {
        data: data.map(obj => dataWithId(obj, primaryKey)),
        total: parseInt(
          headers['content-range']!
            .split('/')
            .pop() || "0",
          10
        )
      };
    });
  },

  getOne: async(resource, params) => {
    const id = params.id;
    const primaryKey = getPrimaryKey(resource, primaryKeys);
    
    const query = getQuery(primaryKey, id, resource);
    
    const url = `${apiUrl}/${resource}?${query}`;
    let myAxios = await myAxiosPrivate();

    return  myAxios.get(url).then(({ data }) => ({
      data: dataWithId(data, primaryKey),
    }))
  },

  getMany:async (resource, params) => {
    const ids = params.ids;
    const primaryKey = getPrimaryKey(resource, primaryKeys);

    const query = getQuery(primaryKey, ids, resource);
      
    const url = `${apiUrl}/${resource}?${query}`;
    let myAxios = await myAxiosPrivate();
    return myAxios.get(url).then(({ data }) => ({ data: data.map(data => dataWithId(data, primaryKey)) }));
  },

  getManyReference: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const parsedFilter = parseFilters(params.filter, defaultListOp);
    const primaryKey = getPrimaryKey(resource, primaryKeys);

    const query = params.target ? {
      [params.target]: `eq.${params.id}`,
      order: getOrderBy(field, order, primaryKey),
      offset: String((page - 1) * perPage),
      limit: String(perPage),
      ...parsedFilter,
    }:{
      order: getOrderBy(field, order, primaryKey),
      offset: String((page - 1) * perPage),
      limit: String(perPage),
      ...parsedFilter,
    };

    const url = `${apiUrl}/${resource}?${new URLSearchParams(query)}`;
    let myAxios = await myAxiosPrivate();

    return myAxios.get(url).then(({ headers, data }) => {
      if (!('content-range' in headers)) {
        throw new Error(
          `The Content-Range header is missing in the HTTP Response. The postgREST data provider expects 
          responses for lists of resources to contain this header with the total number of results to build 
          the pagination. If you are using CORS, did you declare Content-Range in the Access-Control-Expose-Headers header?`
        );
      }
     
      return {
        data: data.map(obj => dataWithId(obj, primaryKey)),
        total: parseInt(
          headers['content-range']!
            .split('/')
            .pop() || "0",
          10
        )
      };
    });
  },

  update: async (resource, params) => {
    const { id, data } = params;
    const primaryKey = getPrimaryKey(resource, primaryKeys);

    const query = getQuery(primaryKey, id, resource);

    const primaryKeyData = getKeyData(primaryKey, data);

    const url = `${apiUrl}/${resource}?${query}`;

    const body = {
      ...data,
      ...primaryKeyData
    }

    let myAxios = await myAxiosPrivate();
    return myAxios.put(url,
      body,
    ).then(({ data }) => ({ data: dataWithId(data, primaryKey) }));
  },

  updateMany: async (resource, params) => {
    const ids = params.ids;
    const primaryKey = getPrimaryKey(resource, primaryKeys);

    const query = getQuery(primaryKey, ids, resource);

    const body = JSON.stringify(
      params.data.map(obj => {
        const { id, ...data } = obj;
        const primaryKeyData = getKeyData(primaryKey, data);

        return {
          ...data,
          ...primaryKeyData
        };
      })
    );

    const url = `${apiUrl}/${resource}?${query}`;

    return httpClient(url, {
      method: 'PATCH',
      headers: new Headers({
        'Prefer': 'return=representation',
        'Content-Type': 'application/json',
      }),
      body,
    }).then(({ json }) => ({
      data: json.map(data => encodeId(data, primaryKey))
    }));
  },

  create: async (resource, params) => {
    const primaryKey = getPrimaryKey(resource, primaryKeys);
    const url = `${apiUrl}/${resource}`;
    let myAxios = await myAxiosPrivate();
    return myAxios.post(url, params.data).then(({ data }) => ({
      data: {
        ...params.data,
        id: encodeId(data, primaryKey)
      }
    }));
  },

  delete: async (resource, params) => {
    const id = params.id;
    const primaryKey = getPrimaryKey(resource, primaryKeys);
    
    const query = getQuery(primaryKey, id, resource);

    const url = `${apiUrl}/${resource}?${query}`;
    let myAxios = await myAxiosPrivate();
    return myAxios.delete(url).then(({ data }) => ({ data: dataWithId(data, primaryKey) }));
  },

  deleteMany: async (resource, params) => {
    const ids = params.ids;
    const primaryKey = getPrimaryKey(resource, primaryKeys);

    const query = getQuery(primaryKey, ids, resource);
      
    const url = `${apiUrl}/${resource}?${query}`;
    let myAxios = await myAxiosPrivate();
    return myAxios.delete(url).then(() => {
      return ({ data: [] })
    });
  },
});

export default dataProvider;