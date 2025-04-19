import { gql } from "@apollo/client";

export const GET_WEATHER_REPORT = gql`
  query GetWeatherReport($date: String) {
    weatherReport(date: $date) {
      id
      timestamp
      temperature
      pressure
      humidity
      cloudCover
    }
  }
`;

export const GET_WEATHER_REPORTS = gql`
  query GetWeatherReports {
    weatherReports {
      id
      timestamp
      temperature
      pressure
      humidity
      cloudCover
    }
  }
`;

export const SAVE_WEATHER_REPORT = gql`
  mutation SaveWeatherReport($input: WeatherReportInput!) {
    saveWeatherReport(input: $input) {
      success
      message
      report {
        id
        timestamp
        temperature
        pressure
        humidity
        cloudCover
      }
    }
  }
`;

export const GetMeGql = gql`
  query GetMe {
    me {
      id
      email
      username
      name
      isEmailVerified
      lastSignedInAt
      mobile
      active
    }
  }
`;

export const SIGN_IN = gql`
  mutation SignIn($identifier: String!, $password: String!) {
    signIn(identifier: $identifier, password: $password) {
      token
      refreshToken
      success
      message
      errors {
        field
        message
      }
    }
  }
`;

export const SIGN_UP = gql`
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      success
      message
      errors {
        field
        message
      }
    }
  }
`;

export const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String!, $callbackUrl: String!) {
    forgotPassword(email: $email, callbackUrl: $callbackUrl) {
      success
      message
      errors {
        field
        message
      }
    }
  }
`;

export const SEND_OTP = gql`
  mutation SendOTP($email: String!) {
    sendOTP(email: $email) {
      success
      message
      errors {
        field
        message
      }
    }
  }
`;

export const VERIFY_OTP = gql`
  mutation VerifyOTP($input: VerifyOTPInput!) {
    verifyOTP(input: $input) {
      success
      message
      errors {
        field
        message
      }
    }
  }
`;

export const RESET_PASSWORD_WITH_OTP = gql`
  mutation ResetPasswordWithOTP(
    $email: String!
    $otp: String!
    $newPassword: String!
  ) {
    resetPasswordWithOTP(email: $email, otp: $otp, newPassword: $newPassword) {
      success
      message
      errors {
        field
        message
      }
    }
  }
`;
