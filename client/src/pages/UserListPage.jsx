import React, { useState, useEffect } from 'react'
import UserList from '../components/UsersComponets/UserList'
import { useData } from '../context/DataContext';
const url = import.meta.env.VITE_BACKEND_URL;

const UserListPage = () => {
  const { setUsersList} = useData()

  useEffect(()=> {
    const getAllUser = async () => {
      try {
        const res = await fetch(url + "/user/getAllUser",{
        credentials:"include"
      })
      const result = await res.json()
      if(res.ok)setUsersList(result)
      } catch (error) {
        console.log("error fetching users",error)
      }
    }

    getAllUser()
  },[])

  return (
   <div className='bg-gray-800 h-full w-full shadow-lg border-r border-gray-700 flex flex-col'>
  <div>
    <div className='h-16 bg-gray-800 text-xl font-bold flex items-center text-white px-4 shadow-md'>
      Users List
    </div>
    <UserList />
  </div>
</div>

  )
}

export default UserListPage
