import axios from 'axios';

export async function getCsrfToken() {
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
}
