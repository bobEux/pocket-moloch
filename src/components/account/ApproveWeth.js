import React, { useContext } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { ethToWei } from '@netgum/utils' // returns BN

import WethService from '../../utils/WethService'
import Web3Service from '../../utils/Web3Service'
import BcProcessorService from '../../utils/BcProcessorService'
import McDaoService from '../../utils/McDaoService'
import Loading from '../shared/Loading'

import {
  CurrentUserContext,
  CurrentWalletContext,
  LoaderContext
} from '../../contexts/Store'
import useModal from '../shared/useModal'

const ApproveWeth = () => {
  const [currentUser] = useContext(CurrentUserContext)
  const [loading, setLoading] = useContext(LoaderContext)
  const [currentWallet] = useContext(CurrentWalletContext)

  const { toggle } = useModal()

  return (
    <>
      {loading && <Loading />}
      <h2>Set wETH Allowance</h2>
      <p>
        Enter the amount you would like to raise your wETH allowance to. Your
        setting here will override any previous setting.
      </p>
      <Formik
        initialValues={{
          amount: '',
          addr: currentUser.attributes['custom:account_address']
        }}
        validate={values => {
          const errors = {}
          if (!values.amount) {
            errors.amount = 'Required'
          }

          return errors
        }}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          const sdk = currentUser.sdk
          const wethService = new WethService()
          const daoService = new McDaoService()
          const web3Service = new Web3Service()
          const bcprocessor = new BcProcessorService()

          const bnZed = ethToWei(0)

          setLoading(true)
          try {
            const data = await wethService.approve(
              values.addr,
              daoService.contractAddr,
              web3Service.toWei(values.amount),
              true
            )

            const estimated = await sdk.estimateAccountTransaction(
              wethService.contractAddr,
              bnZed,
              data
            )

            // console.log(estimated);
            if (ethToWei(currentWallet.eth).lt(estimated.totalCost)) {
              alert(
                `you need more gas, at least: ${web3Service.fromWei(
                  estimated.totalCost.toString()
                )}`
              )
              setLoading(false)
              setSubmitting(false)
              return false
            }

            const hash = await sdk.submitAccountTransaction(estimated)

            bcprocessor.setTx(
              hash,
              currentUser.attributes['custom:account_address'],
              `Update wETH Allowance to ${values.amount}`,
              true
            )
          } catch (err) {
            // TODO: handle errors better
            // eslint-disable-next-line no-console
            console.log(err)
            alert(`Something went wrong. please try again`)
          }

          resetForm()
          setLoading(false)
          setSubmitting(false)
          toggle('allowanceForm')
        }}
      >
        {({ isSubmitting }) => (
          <Form className="Form">
            <Field name="amount">
              {({ field }) => (
                <div className={field.value ? 'Field HasValue' : 'Field '}>
                  <label>Amount</label>
                  <input
                    min="0"
                    type="number"
                    inputMode="numeric"
                    step="any"
                    {...field}
                  />
                </div>
              )}
            </Field>
            <ErrorMessage
              name="amount"
              render={msg => <div className="Error">{msg}</div>}
            />
            <button type="submit" disabled={isSubmitting}>
              Approve
            </button>
          </Form>
        )}
      </Formik>
    </>
  )
}

export default ApproveWeth
