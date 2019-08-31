import React from 'react';
import { withRouter } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Auth } from 'aws-amplify';

import Loading from '../../components/shared/Loading';

const ForgotPassword = ({ history }) => {
  let authError = null;

  return (
    <div className="ForgotPassword">
      <Formik
        initialValues={{ username: '' }}
        validate={(values) => {
          let errors = {};
          if (!values.username) {
            errors.username = 'Required';
          }

          return errors;
        }}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            Auth.forgotPassword(values.username).then(() => {
                history.push('/forget-password-confirm');
              });

            setSubmitting(false);

          } catch (err) {
            console.log('error forgetting pass: ', err);
            authError = err;
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => {
          if (isSubmitting) {
            return <Loading />;
          }

          return (
            <Form className="Form">
              {authError ? (
                <div className="Form__auth-error">{authError.message}</div>
              ) : null}
              <Field name="username">
              {({ field, form }) => (
                <div
                  className={
                    field.value
                      ? 'Field HasValue'
                      : 'Field '
                  }
                >
                  <label>Pseudonym</label>
                  <input type="text" {...field} />
                </div>
              )}
              </Field>
              <ErrorMessage name="username" component="div" />
              <button type="submit" disabled={isSubmitting}>
                Submit
              </button>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default withRouter(ForgotPassword);
