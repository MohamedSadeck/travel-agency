
const InfoPill = ({text, image}: InfoPillProps) => {
  return (
    <figure className="info-pill">
      <img
        src={image}
        alt={text}
    />
    <figcaption className="p-14-regular text-dark-60">
        {text}
    </figcaption>
    </figure>
  )
}

export default InfoPill
