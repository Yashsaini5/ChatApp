import React, { useState, useEffect } from 'react'
import UserList from '../components/UserList'
import { useData } from '../context/DataContext';
const url = import.meta.env.VITE_BACKEND_URL;

const UserListPage = () => {
  const { setSelectedUser, usersList, setUsersList} = useData()

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
    <div className='bg-zinc-500 h-full w-full shadow-md border-r-2 border-zinc-900 flex flex-col'>
      <div>
        <div className='h-16 bg-zinc-800 text-xl font-semibold flex items-center text-white px-4'>Users List -</div>
       <UserList />
    </div>
    </div>
  )
}

export default UserListPage
