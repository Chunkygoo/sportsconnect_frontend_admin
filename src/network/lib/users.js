import myAxiosPrivate from '../myAxiosPrivate';

export async function getCurrentUser(controller = null) {
  try {
    let myAxios = await myAxiosPrivate();
    let res = await myAxios
      .get(`/users/me`, { signal: controller?.signal })
      .catch((e) => {
        return e.response;
      });
    return res;
  } catch (error) {
    console.log(error);
  }
}
