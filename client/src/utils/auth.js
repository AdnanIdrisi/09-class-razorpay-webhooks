export const getErrorMessage = (error) => {
  const response = error.response?.data;
  const firstFieldError = response?.errors?.[0]?.message;
  if (firstFieldError) return firstFieldError;
  if (response?.message) return response.message;
  if (error.request)
    return "Cannot reach the server. Start the backend and try again.";
  return "Something went wrong. Please try again.";
};

export const saveSession = (data) => {
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("user", JSON.stringify(data.user));
};
