const SAQ = () => {
    return (
      <div className="flex flex-col items-center space-y-4">
        <input
          type="text"
          placeholder="Question"
          className="border border-gray-300 p-2 rounded text-black"
        />
        <input
          type="text"
          placeholder="Gist"
          className="border border-gray-300 p-2 rounded text-black"
        />
        <button className="bg-blue-500 text-white px-4 py-3 rounded mt-4">
            Submit
        </button>
      </div>
    );
  };
  
  export default SAQ;