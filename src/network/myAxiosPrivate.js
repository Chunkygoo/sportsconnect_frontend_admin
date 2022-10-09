import axios from 'axios';
import Session from 'supertokens-auth-react/recipe/session';

const getCsrfToken = async () => {
  try {
    let res = await axios
      .get(`${process.env.REACT_APP_API_DATA_URL}/auth/csrf_token`, {
        withCredentials: true,
      })
      .catch((e) => {
        return e.response;
      });
    return res.data.csrf_token;
  } catch (error) {
    console.log(error);
  }
};

export default async function myAxiosPrivate() {
  const csrfToken = await getCsrfToken();
  const myAxios = axios.create({
    baseURL: process.env.REACT_APP_API_DATA_URL,
    headers: { 'x-csrf-token': csrfToken },
    withCredentials: true,
  });
  Session.addAxiosInterceptors(myAxios);
  return myAxios;
}
