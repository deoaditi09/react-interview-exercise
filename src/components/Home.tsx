import React, { useEffect, useState } from "react";
import {
    VStack,
    Input,
    Center,
    Spinner,
    Text,
    Tr,
    Table,
    Thead,
    Th,
    Tbody,
    Td,
    Box,
    HStack,
    Button,
} from "@chakra-ui/react";
import { FixedSizeList as VirtualList } from "react-window";
import {
    searchSchoolDistricts,
    searchSchools,
    NCESDistrictFeatureAttributes,
    NCESSchoolFeatureAttributes,
} from "@utils/nces";

const ITEMS_PER_PAGE = 10;

const Home: React.FC = () => {
    const [searching, setSearching] = useState(false);
    const [districtSearch, setDistrictSearch] = useState<NCESDistrictFeatureAttributes[]>([]);
    const [schoolSearch, setSchoolSearch] = useState<NCESSchoolFeatureAttributes[]>([]);
    const [query, setQuery] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState<NCESDistrictFeatureAttributes | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchDistricts = async () => {
            setSearching(true);
            const results = await searchSchoolDistricts(query);
            setDistrictSearch(results);
            setSearching(false);
        };

        if (query.trim().length > 0) {
            fetchDistricts();
        } else {
            setDistrictSearch([]);
        }
    }, [query]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    const handleDistrictClick = async (district: NCESDistrictFeatureAttributes) => {
        setSearching(true);
        setSelectedDistrict(district);
        setDistrictSearch([]);
        const schools = await searchSchools("", district.LEAID);
        setSchoolSearch(schools);
        setCurrentPage(1);
        setSearching(false);
    };

    const paginatedSchools = schoolSearch.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const totalPages = Math.ceil(schoolSearch.length / ITEMS_PER_PAGE);

    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const district = districtSearch[index];
        return (
            <Box
                style={{ ...style, padding: "8px", cursor: "pointer" }}
                onClick={() => handleDistrictClick(district)}
                _hover={{ bg: "gray.100" }}
            >
                <Text>{district.NAME}</Text>
            </Box>
        );
    };

    return (
        <VStack spacing={4} align="center" pt="90px" w="100%">
            <Box position="relative" w="50%">
                <Input
                    placeholder="Search district"
                    value={query}
                    type="text"
                    name="districtInput"
                    onChange={handleInputChange}
                    width="100%"
                />

                {searching ? (
                    <Center mt={4}>
                        <Spinner size="md" />
                    </Center>
                ) : districtSearch.length > 0 ? (
                    <Box
                        position="absolute"
                        top="100%"
                        left={0}
                        zIndex={10}
                        bg="white"
                        boxShadow="md"
                        width="100%"
                        maxH="300px"
                        overflow="hidden"
                    >
                        <VirtualList
                            height={300}
                            itemCount={districtSearch.length}
                            itemSize={45}
                            width="100%"
                        >
                            {Row}
                        </VirtualList>
                    </Box>
                ) : (
                    query && !selectedDistrict && <Text mt={2}>No District Found</Text>
                )}
            </Box>

            <Box w="50%" mt={6}>
                {selectedDistrict?.NAME && (
                    <>
                        <Text fontWeight="bold" fontSize="lg" mb={2}>
                            Schools in District: {selectedDistrict.NAME}
                        </Text>

                        {searching ? (
                            <Center mt={4}>
                                <Spinner size="md" />
                            </Center>
                        ) : (
                            <>
                                {paginatedSchools && paginatedSchools.length > 0 ? (
                                    <>
                                        <Table size="sm" variant="simple">
                                            <Thead bg="gray.100">
                                                <Tr>
                                                    <Th>Name</Th>
                                                    <Th>City</Th>
                                                    <Th>State</Th>
                                                    <Th>NCESSCH</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {paginatedSchools.map((school) => (
                                                    <Tr key={school.NCESSCH}>
                                                        <Td>{school.NAME}</Td>
                                                        <Td>{school.CITY}</Td>
                                                        <Td>{school.STATE}</Td>
                                                        <Td>{school.NCESSCH}</Td>
                                                    </Tr>
                                                ))}
                                            </Tbody>
                                        </Table>

                                        {totalPages > 1 && (
                                            <HStack mt={4} justify="center">
                                                <Button
                                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                                    isDisabled={currentPage === 1}
                                                    size="sm"
                                                >
                                                    Prev
                                                </Button>
                                                <Text>
                                                    Page {currentPage} of {totalPages}
                                                </Text>
                                                <Button
                                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                                    isDisabled={currentPage === totalPages}
                                                    size="sm"
                                                >
                                                    Next
                                                </Button>
                                            </HStack>
                                        )}
                                    </>
                                ) : (
                                    <Text mt={4}>No Schools Found for District.</Text>
                                )}
                            </>
                        )}
                    </>
                )}
            </Box>
        </VStack>
    );
};

export default Home;
