import { useParams } from "react-router-dom"

const UserProfile = () => {

    const id = useParams();

    console.log("iddd",id.user_id)


  return (
    <div>UserProfile</div>
  )
}

export default UserProfile
