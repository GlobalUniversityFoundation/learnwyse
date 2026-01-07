import { useNavigate, useParams } from 'react-router-dom'

function SocialScience() {
  const navigate = useNavigate()

  const chapters = {
    history: {
      title: 'History: Our Pasts-II',
      items: [
        'Chapter 1: Tracing Changes Through a Thousand Years',
        'Chapter 2: New Kings and Kingdoms',
        'Chapter 3: The Delhi Sultans',
        'Chapter 4: The Mughal Empire',
        'Chapter 5: Rulers and Buildings',
        'Chapter 6: Towns, Traders, and Craftspersons',
        'Chapter 7: Tribes, Nomads, and the Settled Communities',
        'Chapter 8: Devotional Paths to the Divine',
        'Chapter 9: The Making of Regional Cultures',
        'Chapter 10: Eighteenth-Century Political Formations'
      ]
    },
    civics: {
      title: 'Civics: Social and Political Life-II',
      items: [
        'Chapter 1: On Equality',
        'Chapter 2: Role of the Government in Health',
        'Chapter 3: How the State Government Works',
        'Chapter 4: Growing Up As Boys And Girls',
        'Chapter 5: Women, Changed the World',
        'Chapter 6: Media and Advertisement',
        'Chapter 7: In the Markets Around Us',
        'Chapter 8: A Shirt in the Market'
      ]
    },
    geography: {
      title: 'Geography: Our Environment',
      items: [
        'Chapter 1: Environment',
        'Chapter 2: Inside Our Earth',
        'Chapter 3: Our Changing Earth',
        'Chapter 4: Air',
        'Chapter 5: Water',
        'Chapter 6: Natural Vegetation and Wildlife',
        'Chapter 7: Human Environment - Settlement, Transport and Communication'
      ]
    }
  }

  const handleChapterClick = (chapterName) => {
    // Navigate to video player for "How the State Government Works"
    if (chapterName === 'Chapter 3: How the State Government Works') {
      navigate('/study/social-science/video/how-the-state-government-works')
    }
  }

  return (
    <div className="social-science-page">
      <div className="social-science-header">
        <h1 className="social-science-logo" onClick={() => navigate('/study')}>
          LearnWyse
        </h1>
        <h2 className="social-science-title">Social Science</h2>
      </div>

      <div className="social-science-content">
        <div className="chapters-sidebar">
          {Object.entries(chapters).map(([key, section]) => (
            <div key={key} className="chapter-section">
              <h3 className="section-title">{section.title}</h3>
              <ul className="chapter-list">
                {section.items.map((chapter, index) => (
                  <li
                    key={index}
                    className="chapter-item"
                    onClick={() => handleChapterClick(chapter)}
                  >
                    {chapter}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="content-area">
          <div className="welcome-message">
            <h3>Welcome to Social Science</h3>
            <p>Select a chapter from the sidebar to begin learning</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SocialScience

