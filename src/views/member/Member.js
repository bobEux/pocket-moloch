import React from 'react'
import { Query } from 'react-apollo'

import { GET_MEMBER_QUERY } from '../../utils/MemberService'
import MemberDetail from '../../components/member/MemberDetail'
import ErrorMessage from '../../components/shared/ErrorMessage'
import BottomNav from '../../components/shared/BottomNav'
import Loading from '../../components/shared/Loading'

const Member = props => {
  const id = props.match.params.id

  return (
    <div className="View">
      <Query query={GET_MEMBER_QUERY} variables={{ id }}>
        {({ loading, error, data }) => {
          if (loading) return <Loading />
          if (error) return <ErrorMessage message={error} />
          return (
            <div className="MemberDetail">
              <MemberDetail member={data.member} />
            </div>
          )
        }}
      </Query>
      <BottomNav />
    </div>
  )
}

export default Member
