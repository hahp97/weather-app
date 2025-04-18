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
