
import React, {useState, useEffect} from 'react'
import { AnimatePresence, motion } from "framer-motion"
import { useSnapshot } from "valtio"

import config from '../config/config';
import state from "../store";
import { download} from '../assets'
import { downloadCanvasToImage, reader} from '../config/helpers';
import { EditorTabs, FilterTabs, DecalTypes } from '../config/constants'
import { fadeAnimation, slideAnimation } from "../config/motion";
import { AiPicker, ColorPicket, FilePicker, Tab, CustomButton } from "../components";


const Customizer = () => {
    const snap = useSnapshot(state)

    const [file, setfile] = useState('');

    const [prompt, setprompt] = useState('');
    const [generatingimg, setgeneratingimg] = useState(false)
    const [activedittab, setactivedittab] = useState('');
    const [activefiltertab, setactivefiltertab] = useState({
      logoShirt: true,
      stylishShirt: false,
    })

    const generateTabContent = () => {
      switch (activedittab) {
        case "colorpicker":
          return <ColorPicket />
        case "filepicker":
          return <FilePicker
            file={file}
            setfile={setfile}
            readFile={readFile}
          />
        case "aipicker" :
          return   <AiPicker 
            prompt={prompt}
            setPrompt={setprompt}
            generatingImg={generatingimg}
            handleSubmit={handleSubmit}
          />
      
        default:
          return null;
      }
    }

    const handleSubmit = async (type) => {
      if(!prompt) return alert("Please enter a propmt");

      try {
        setgeneratingimg(true)

        const response = await fetch('http://localhost:8080/api/v1/asad', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'  
          },
          body: JSON.stringify({
            prompt,
          })
        })

        const data = await response.json();

        handleDecals(type, `data:image/png;base64,${data.photo}`)
        
      } catch (error) {
        alert(error)
      } finally {
        setgeneratingimg(false);
        setactivedittab("");
      }
    }

    const handleactivefiltertab = (tabname) => {
      switch (tabname) {
        case "logoShirt":
            state.isLogoTexture = !activefiltertab[tabname];
          break;
        case "stylishShirt":
          state.isFullTexture = !activefiltertab[tabname];
          break;  
        default:
          state.isLogoTexture = true;
          state.isFullTexture = false;
      }

      setactivefiltertab((prevState) => {
        return {
          ...prevState,
          [tabname]: !prevState[tabname]
        }
      })
    }

    const handleDecals = (type, result) => {
      const decalType = DecalTypes[type];

      state[decalType.stateProperty] = result;

      if(!activefiltertab[decalType.filterTab]) {
        handleactivefiltertab(decalType.filterTab)
      }
    }

    const readFile = (type) => {
      reader(file)
      .then((result) => {
        handleDecals(type, result);
        setactivedittab("");
      })
    }

  return (
    <AnimatePresence >
      {!snap.intro && (
        <>
          <motion.div 
            key="custom"
            className="absolute top-0 left-0 z-10"
            {...slideAnimation('left')}
          >
            <div className='flex items-center min-h-screen'>
              <div className='editortabs-container tabs'>
                {EditorTabs.map((tab) => (
                  <Tab
                    key={tab.name}
                    tab={tab}
                    handleClick={() => setactivedittab(tab.name)}
                  />
                ))}

                {generateTabContent()}
              </div>
            </div>

          </motion.div>
          
          <motion.div 
            className='absolute z-10 top-5 right-5'
            {...fadeAnimation}
          >
            <CustomButton
              type="filled"
              title="Go Back"
              handleClick={() => state.intro = true}
              customStyles="w-fit px-4 py-2.5 font-bold text-sm"    
            />      
          </motion.div>

          <motion.div 
            className='filtertabs-container'
            {...slideAnimation("up")}
          >
            {FilterTabs.map((tab) => (
              <Tab
                key={tab.name}
                tab={tab}
                isFilterTab
                isActiveTab={activefiltertab[tab.name]}
                handleClick={() => handleactivefiltertab(tab.name)}
              />
            ))}
          </motion.div>

        </>
      )}


    </AnimatePresence>
  )
}

export default Customizer