import { ComboBoxComponent } from "@syncfusion/ej2-react-dropdowns";
import { Header } from "components"
import type { Route } from "./+types/create-trip";
import { useMemo, useState } from "react";
import { comboBoxItems, selectItems, travelStyles } from "~/constants";
import { cn, formatKey } from "lib/utils";
import { LayerDirective, LayersDirective, MapsComponent } from "@syncfusion/ej2-react-maps";
import { world_map } from "~/constants/world_map";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { account } from "~/appwrite/client";
import { useNavigate } from "react-router";

export const loader = async () => {
  console.log('Fetching countries data from REST Countries API...');
  const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,latlng,maps');
  const data = await response.json();

  const countries: Country[] = data.map((country: any) => ({
    name: country.name.common,
    coordinates: country.latlng as [number, number],
    value: country.name.common,
    openStreetMap: country.maps?.openStreetMaps,
    flag: country.flags?.png || country.flags?.svg
  })).filter((country: Country) => country.coordinates && country.coordinates.length === 2);
  return { countries };
}

// Move templates outside component to prevent recreation on every render
const itemTemplate = (data: any) => (
  <div className="flex items-center gap-2">
    {data.flag && <img src={data.flag} alt="" className="w-6 h-4 object-contain" loading="lazy" />}
    <span>{data.name}</span>
  </div>
);

const CreateTrip = ({ loaderData }: Route.ComponentProps) => {

  const navigate = useNavigate();

  const [formData, setFormData] = useState<TripFormData>({
    country: 'Algeria',
    travelStyle: '',
    interest: '',
    budget: '',
    duration: 0,
    groupType: ''
  });

  const [error, setError] = useState<string|null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { countries } = loaderData;

  // Memoize countriesData to prevent recreation on every render
  const countriesData = useMemo(() =>
    countries.map(country => ({
      name: country.name,
      value: country.value,
      flag: country.flag
    })), [countries]
  );

  const mapData = [{
    country: formData.country,
    color: '#EA382E',
    coordinates: countries.find(c => c.name === formData.country)?.coordinates || [0, 0]
  }]

  // Create a lookup map for faster access in valueTemplate
  const countryMap = useMemo(() =>
    new Map(countriesData.map(c => [c.value, c])),
    [countriesData]
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if( !formData.country || !formData.duration || !formData.travelStyle || !formData.interest || !formData.budget || !formData.groupType ) {
      setError('Please fill out all required fields.');
      setLoading(false);
      return;
    }

    if(formData.duration < 1 || formData.duration > 10) {
      setError('Duration must be between 1 and 10 days.');
      setLoading(false);
      return;
    }

    const user = await account.get();
    if(!user.$id){
      console.log('User is not Authenticated')
      setError('You must be logged in to create a trip.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/create-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country: formData.country,
          numberOfDays: formData.duration,
          travelStyle: formData.travelStyle,
          interests: formData.interest,
          budget: formData.budget,
          groupType: formData.groupType,
          userId: user.$id
        })
      });

      const result : CreateTripResponse = await response.json();
      if (result?.id) {
        navigate(`/trips/${result.id}`);
      }else{
        console.error('Error creating trip: Invalid response', result);
        setError('An error occurred while creating the trip. Please try again.');
      }
    } catch (error) {
      console.error('Error creating trip:', error);
      setError('An error occurred while creating the trip. Please try again.');
      return;
    }finally{
      setLoading(false);
    }



  }

  const handleChange = (key: keyof TripFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }

  return (
    <main className="flex flex-col gap-10 pb-20 wrapper">
      <Header
        title="Create New Trip"
        description="Fill out the details below to create a new travel itinerary."
      />

      <section className="mt-2.5 wrapper-md">
        <form className="trip-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="country" className="form-label">Country</label>
            <ComboBoxComponent
              id="country"
              dataSource={countriesData}
              fields={{ text: 'name', value: 'value' }}
              placeholder="Select a Country"
              className="combo-box"
              value={formData.country}
              change={(e: { value: string | undefined }) => {
                if (e.value) {
                  handleChange('country', e.value);
                }
              }}
              allowFiltering={true}
              autofill={false}
              showClearButton={true}
              filtering={(e) => {
                const query = e.text.toLowerCase()
                e.updateData(
                  countries.filter((country) => country.name.toLowerCase().includes(query)).map((country) => ({
                    name: country.name,
                    value: country.value,
                    flag: country.flag
                  }))
                )
              }}
              itemTemplate={itemTemplate}
            />
          </div>
          <div>
            <label htmlFor="duration" className="form-label">Duration</label>
            <input
              id="duration"
              type="number"
              className="form-input"
              placeholder="Enter number of days (e.g., 7)"
              onChange={(e) => handleChange('duration', Number(e.target.value))}
              required
            />
          </div>
          {selectItems.map((key) => (
            <div key={key}>
              <label htmlFor={key} className="form-label">{formatKey(key)}</label>
              <ComboBoxComponent
                id={key}
                dataSource={comboBoxItems[key].map((item) => (
                  { text: item, value: item }
                ))}
                fields={{ text: 'text', value: 'value' }}
                placeholder={`Select a ${formatKey(key)}`}
                className="combo-box"
                change={(e: { value: string | undefined }) => {
                  if (e.value) {
                    handleChange(key, e.value);
                  }
                }}
                allowFiltering={true}
                filtering={(e) => {
                  const query = e.text.toLowerCase()
                  e.updateData(
                    comboBoxItems[key].filter((item) => item.toLowerCase().includes(query)).map((item) => ({
                      text: item, value: item
                    }))
                  )
                }}
              />
            </div>
          ))}
          <div>
            <label htmlFor="location" className="form-label">Location on the world map</label>
            <MapsComponent>
              <LayersDirective>
                <LayerDirective
                  shapeData={world_map}
                  dataSource={mapData}
                  shapePropertyPath='name'
                  shapeDataPath="country"
                  shapeSettings={{ colorValuePath: 'color', fill: '#e5e5e5' }}
                />
              </LayersDirective>
            </MapsComponent>
          </div>
          <div className="bg-gray-200 h-px w-full"/>
          {error && (
            <div className="error">
              <p>{error}</p>

            </div>
          )}
          <footer className="px-6 w-full">
            <ButtonComponent
            type="submit"
            className="button-class !h-12 !w-full"
            disabled={loading}
            >
              <img
                src={`/assets/icons/${loading ? 'loader' : 'magic-star'}.svg`}
              alt={loading ? 'Loading' : 'Magic Star'}
              className={cn('size-5', { 'animate-spin': loading })}
              />
              <span className="p-16-semibold text-white">{loading ? 'Generating Trip...' : 'Generate Trip'}</span>
            </ButtonComponent>
          </footer>
        </form>

      </section>

    </main>
  )
}

export default CreateTrip
