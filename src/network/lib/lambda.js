import myAxiosPrivate from '../myAxiosPrivate';

export async function keepLambdaWarm() {
  try {
    let myAxios = await myAxiosPrivate();
    let res = await myAxios.get(`/healthdata`).catch((e) => {
      return e.response;
    });
    return res;
  } catch (error) {
    console.log(error);
  }
}
